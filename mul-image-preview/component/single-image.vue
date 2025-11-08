<template>
  <view class="single-image">
    <img
        v-if="simple"
        :src="src"
        alt="simple image" style="width: 100%"/>
    <img
        v-else
        :id="id"
        :src="src"
        alt="single image" :style="imageStyle" @touchstart="onTouchStart" @touchmove="onTouchMove"
        @touchend="onTouchEnd" @load="getImageSize"/>
  </view>
</template>
<script>
const SCALE_TIMES = 2;
const ACCELERATION = 0.0025;
export default {
  name: "single-image",
  props: {
    src: {
      type: String,
      required: true,
      default: () => ''
    },
    windowHeight: {
      type: Number,
      required: true,
      default: () => 0
    },
    simple: {
      type: Boolean,
      default: () => false
    },
    isCurrent: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      scaleRate: 1,
      offsetX: 0,
      offsetY: 0,
      imageSize: {},
      touches: {},
      isZooming: false,
      zoomState: {},
      timer: null,
      uniTimer: null,
      clickFlag: false,
      id: `image${Math.random().toString(26).substring(2)}`,
      outerOffsetX: 0,
      uniState: {}
    }
  },
  computed: {
    imageStyle() {
      return {
        width: '100%',
        transform: `scale(${this.scaleRate}) translate(${this.offsetX}px, ${this.offsetY}px)`
      }
    }
  },
  watch: {
    isCurrent(newValue) {
      !newValue && this.reset();
    }
  },
  methods: {
    reset() {
      console.log('reset', this.id)
      this.offsetY = 0;
      this.offsetX = 0;
      this.scaleRate = 1;
      clearInterval(this.uniTimer);
      clearTimeout(this.timer);
    },
    getImageSize() {
      if (!this.imageSize.width || !this.imageSize.height) {
        uni.createSelectorQuery().in(this).select(`#${this.id}`)
            .fields({
              size: true
            }, (node) => {
              this.imageSize.width = node.width;
              this.imageSize.height = node.height;
            }).exec()
      }
    },
    updateTouches(e, type = 'touchstart') {
      for (let item of e.changedTouches) {
        if (type === 'touchstart') {
          this.touches[item.identifier] = {
            id: item.identifier,
            pageX: item.pageX,
            pageY: item.pageY,
            timeStamp: e.timeStamp
          }
        } else if (type === 'touchmove') {
          const t = this.touches[item.identifier];
          t.pageX = item.pageX;
          t.pageY = item.pageY;
          t.timeStamp = e.timeStamp;
          t.isMoved = true;
        }
      }
    },
    onTouchStart(e) {
      clearInterval(this.uniTimer);
      this.updateTouches(e, 'touchstart');
    },
    onTouchMove(e) {
      const toucheIds = Object.keys(e.touches);
      if (toucheIds.length === 1) {
        const previousTouch = this.touches[e.changedTouches[0].identifier];
        const offsetY = (e.changedTouches[0].pageY - previousTouch.pageY) / this.scaleRate;
        this.translateX((e.changedTouches[0].pageX - previousTouch.pageX) / this.scaleRate, offsetY);
        this.translateY(offsetY);
      } else {
        if (this.isZooming) {
          const firstPrevious = this.touches[this.zoomState.firstId];
          const secondPrevious = this.touches[this.zoomState.secondId];
          const first = e.touches[this.zoomState.firstId];
          const second = e.touches[this.zoomState.secondId];
          if (!firstPrevious || !secondPrevious || !first || !second) {
            this.finishZoom()
          } else {
            const previousDis = this.getDistance(firstPrevious, secondPrevious);
            const currentDis = this.getDistance(first, second);
            this.changeScale((currentDis - previousDis) / previousDis, this.zoomState.origin)
          }
        } else {
          this.zoomState.firstId = e.touches[0].identifier;
          this.zoomState.secondId = e.touches[1].identifier;
          this.zoomState.origin = {
            x: (e.touches[0].pageX + e.touches[1].pageX) / 2,
            y: (e.touches[0].pageY + e.touches[1].pageY) / 2
          }
          this.isZooming = true;
        }
      }
      this.updateTouches(e, 'touchmove');
    },
    getDistance(p1, p2) {
      return Math.sqrt((p1.pageX - p2.pageX) ** 2 + (p1.pageY - p2.pageY) ** 2);
    },
    onTouchEnd(e) {
      const onlySingleTouch = e.changedTouches.length === 1 && Object.keys(this.touches).length === 1;
      const previousTouch = this.touches[e.changedTouches[0].identifier];
      if (onlySingleTouch && !previousTouch.isMoved && e.timeStamp - previousTouch.timeStamp <= 150) {
        if (this.timer) {
          // 双击
          this.changeScale(SCALE_TIMES, {
            x: e.changedTouches[0].pageX,
            y: e.changedTouches[0].pageY
          });
          this.clickFlag = false;
        } else {
          // 单击
          this.clickFlag = true;
          clearTimeout(this.timer);
          this.timer = setTimeout(() => {
            this.clickFlag = false;
            this.timer = null;
          }, 200)
        }
      } else {
        if (onlySingleTouch) {
          this.$emit('translate-end');
          this.outerOffsetX = 0;
          const id = e.changedTouches[0].identifier;
          this.uniState.vy0 = (e.changedTouches[0].pageY - this.touches[id].pageY) / (e.timeStamp - this.touches[id].timeStamp);
          this.uniState.vx0 = (e.changedTouches[0].pageX - this.touches[id].pageX) / (e.timeStamp - this.touches[id].timeStamp);
          this.uniState.time = Date.now();
          this.uniTimer = setInterval(() => {
            if (!this.uniTranslateY()) {
              clearInterval(this.uniTimer);
            }
          })
        }
        this.clickFlag = false;
      }
      for (let item of e.changedTouches) {
        delete this.touches[item.identifier];
      }
      if (!Object.keys(this.touches).length) {
        if (this.scaleRate < 1) {
          this.$nextTick(this.reset)
        }
      }
    },
    translateX(offset, offsetY = 0, ignorOuter = false) {
      if (!this.imageSize.width || this.scaleRate < 1) return false;
      const maxValue = (this.imageSize.width * (this.scaleRate - 1)) / (2 * this.scaleRate);
      const result = this.offsetX + offset;
      if (result > maxValue) {
        if (!ignorOuter) {
          this.outerOffsetX += (result - maxValue) * this.scaleRate;
          Math.abs(offset) > Math.abs(offsetY) && this.$emit('outer-translate', (result - maxValue) * this.scaleRate);
        }
        this.offsetX = maxValue;
      } else if (result < -1 * maxValue) {
        if (!ignorOuter) {
          this.outerOffsetX += (result + maxValue) * this.scaleRate;
          Math.abs(offset) > Math.abs(offsetY) && this.$emit('outer-translate', (result + maxValue) * this.scaleRate);
        }
        this.offsetX = -1 * maxValue
      } else if (this.outerOffsetX) {
        const rst = this.outerOffsetX + offset * this.scaleRate;
        if (this.outerOffsetX * rst < 0) {
          this.$emit('outer-translate', -1 * this.outerOffsetX);
          this.offsetX += rst;
          this.outerOffsetX = 0;
        } else {
          this.$emit('outer-translate', offset * this.scaleRate);
          this.outerOffsetX = rst;
        }
      } else {
        this.offsetX = result;
        return true
      }
    },
    translateY(offset) {
      const imageHeight = this.imageSize.height;
      if (!imageHeight || imageHeight * this.scaleRate <= this.windowHeight) {
        return false;
      }
      const baseValue = (imageHeight / 2) * (this.scaleRate - 1) - Math.max((this.windowHeight - imageHeight) / 2, 0);
      const maxValue = baseValue / this.scaleRate;
      const minValue = -1 * (imageHeight * this.scaleRate - this.windowHeight - baseValue) / this.scaleRate;
      const pOffsetY = this.offsetY;
      this.offsetY = Math.max(Math.min(this.offsetY + offset, maxValue), minValue);
      return pOffsetY + offset === this.offsetY;
    },
    changeScale(offset, point) {
      if (this.scaleRate + offset < 0.5 || this.scaleRate > 10) {
        return;
      }
      const originX = this.imageSize.width / 2;
      const originY = Math.max(this.imageSize.height, this.windowHeight) / 2;
      const x = (point.x - originX) * (this.scaleRate + offset) / this.scaleRate + originX;
      const y = (point.y - originY) * (this.scaleRate + offset) / this.scaleRate + originY;
      this.scaleRate += offset;
      this.translateX((point.x - x) / this.scaleRate);
      this.translateY((point.y - y) / this.scaleRate);
    },
    finishZoom() {
      this.zoomState = {};
      this.isZooming = false;
    },
    uniTranslateY() {
      const now = Date.now();
      const t = now - this.uniState.time;
      this.uniState.time = now;
      let flagX = true;
      let flagY = true;
      if (this.uniState.vy0) {
        const vyt = this.uniState.vy0 + ACCELERATION * (this.uniState.vy0 > 0 ? -1 : 1) * t;
        if (this.uniState.vy0 * vyt < 0) {
          this.uniState.vy0 = 0;
          flagY = false
        } else {
          const offset = (this.uniState.vy0 + vyt) * t / 2;
          this.uniState.vy0 = vyt;
          flagY = this.translateY(offset / this.scaleRate)
        }
      }
      if (this.uniState.vx0) {
        const vxt = this.uniState.vx0 + ACCELERATION * (this.uniState.vx0 > 0 ? -1 : 1) * t;
        if (this.uniState.vx0 * vxt < 0) {
          this.uniState.vx0 = 0;
          flagX = false
        } else {
          const offset = (this.uniState.vx0 + vxt) * t / 2;
          this.uniState.vx0 = vxt;
          flagX = this.translateX(offset / this.scaleRate, 0, true);
        }
      }
      return flagX || flagY;
    }
  },
  beforeDestroy() {
    clearTimeout(this.timer);
    clearInterval(this.uniTimer);
  }
}
</script>

<style scoped>
.single-image {
  width: 100%;
  max-height: 100%;
  font-size: 0;
  flex-shrink: 0;
}
</style>