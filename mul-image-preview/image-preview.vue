<template>
  <view class="mul-image-preview">
    <!-- #ifndef MP-WEIXIN -->
    <view :class="['outer-images', {'translate-end': transition}]"
          :style="`transform: translate(${outerOffsetX}px, 0)`" @transitionend="onTransitionEnd">
      <single-image simple :src="images[images.length - 1]" :window-height="windowHeight"/>
      <single-image v-for="(item, index) in images" :key="index" :src="item" :window-height="windowHeight"
                    @outer-translate="onTranslate" @translate-end="onTranslateEnd" :is-current="current === index + 1"/>
      <single-image simple :src="images[0]" :window-height="windowHeight"/>
    </view>
    <!-- #endif -->
  </view>
</template>

<script>
import SingleImage from "./component/single-image.vue";

export default {
  components: {SingleImage},
  props: {
    images: {
      type: Array,
      default: () => ([])
    },
    currentIndex: {
      type: Number,
      default: () => 0
    }
  },
  data() {
    return {
      windowHeight: 0,
      windowWidth: 0,
      outerOffsetX: 0,
      touchDistance: 0,
      timePeriod: 0,
      current: this.currentIndex + 1,
      transition: false,
      nextCurrent: 0
    };
  },
  methods: {
    resize() {
      const {windowWidth: width, windowHeight: height} = uni.getSystemInfoSync();
      this.windowHeight = height;
      this.windowWidth = width;
      this.outerOffsetX = -1 * this.windowWidth * this.current;
    },
    onTranslate(offset) {
      this.outerOffsetX += offset;
      this.touchDistance += offset;
      if (!this.timePeriod) {
        this.timePeriod = Date.now();
      }
    },
    setOffsetX(offset, transition = true) {
      this.transition = transition;
      this.outerOffsetX = offset;
    },
    onTranslateEnd() {
      const nextCurrent = (this.current + 1) % this.images.length || this.images.length;
      const previousCurrent = (this.current - 1 + this.images.length) % this.images.length || this.images.length;
      const nextAbs = Math.abs(-1 * this.windowWidth * (nextCurrent === 1 ? this.images.length + 1 : nextCurrent) - this.outerOffsetX);
      const previousAbs = Math.abs(-1 * this.windowWidth * (previousCurrent === this.images.length ? 0 : previousCurrent) - this.outerOffsetX);
      const speed = this.touchDistance / (Date.now() - this.timePeriod);
      console.log("speed", speed)
      if (nextAbs <= this.windowWidth / 2 || previousAbs <= this.windowWidth / 2) {
        this.current = nextAbs <= previousAbs ? nextCurrent : previousCurrent;
      } else if (Math.abs(speed) > 1) {
        this.current = speed > 0 ? previousCurrent : nextCurrent;
      } else {
        this.setOffsetX(-1 * this.windowWidth * this.current);
      }
      this.touchDistance = 0;
      this.timePeriod = 0;
    },
    onTransitionEnd() {
      this.transition = false;
      if (this.nextCurrent) {
        this.setOffsetX(-1 * this.windowWidth * this.nextCurrent, false);
        this.nextCurrent = 0;
      }
    }
  },
  watch: {
    current(newValue, oldValue) {
      if (Math.abs(newValue - oldValue) === 1) {
        this.setOffsetX(-1 * this.windowWidth * newValue);
      } else if (newValue === 1) {
        this.setOffsetX(-1 * this.windowWidth * (this.images.length + 1));
        this.nextCurrent = 1;
      } else {
        this.setOffsetX(0);
        this.nextCurrent = this.images.length;
      }
    }
  },
  mounted() {
    // #ifndef MP-WEIXIN
    this.resize();
    uni.onWindowResize(this.resize);
    // #endif
    // #ifdef MP-WEIXIN
    uni.previewImage({
      urls: this.images,
      current: this.currentIndex
    })
    // #endif
  },
  beforeDestroy() {
    // #ifndef MP-WEIXIN
    uni.offWindowResize(this.resize);
    // #endif
  }
}
</script>

<style scoped lang="css">
.mul-image-preview {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.9);
}

.mul-image-preview .outer-images {
  height: 100%;
  display: flex;
  align-items: center;
}

.mul-image-preview .outer-images.translate-end {
  transition: transform linear 200ms;
}
</style>
