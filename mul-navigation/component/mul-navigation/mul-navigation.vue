<template>
  <view class="mul-navigation">
    <view class="home" v-show="!other" :style="[leftStyle]">
      <nav-title :value="true" @back="onBack" :title="title" :position="titlePosition" v-if="!hideTitle"></nav-title>
      <slot name="home"></slot>
    </view>
    <view class="nav-destination-wrapper" :style="[rightStyle]">
      <slot v-if="value" name="default"></slot>
    </view>
  </view>
</template>

<script>
import NavTitle from "../nav-title/nav-title.vue";

export default {
  name: "MulNavigation",
  options: {styleIsolation: 'shared'},
  components: {
    NavTitle
  },
  props: {
    value: {
      type: Boolean,
      default: () => false
    },
    title: {
      type: String,
      default: () => ""
    },
    titlePosition: {
      type: String,
      default: () => "start"
    },
    hideTitle: {
      type: Boolean,
      default: () => false
    },
    half: {
      type: Boolean,
      default: () => true
    },
    self: {
      type: Boolean,
      default: () => true
    },
    other: {
      type: Boolean,
      default: () => false
    }
  },
  methods: {
    onBack(tag) {
      if (this.showParallel) {
        this.showParallel = false;
        return true;
      } else if (this.showSelf && this.$listeners['update:self']) {
        this.showSelf = false;
        return true;
      } else {
        !tag && uni.navigateBack();
        return false;
      }
    }
  },
  computed: {
    placeholderHeight() {
      return (getApp().globalData.statusBarHeight || 0) + (this.hideTitle ? 0 : 45);
    },
    homeParallelWidth() {
      return this.half ? '50%' : '40%';
    },
    destinationParallelWidth() {
      return this.half ? '50%' : '60%';
    },
    destinationParallelLeft() {
      return this.half ? '50%' : '40%';
    },
    isPhone() {
      return this.device === 'phone';
    },
    leftStyle() {
      return {
        width: this.showParallel && !this.isPhone ? this.homeParallelWidth : '100%',
        paddingTop: this.placeholderHeight + 'px'
      }
    },
    rightStyle() {
      return {
        width: this.showParallel && !this.isPhone && !this.other ? this.destinationParallelWidth : '100%',
        left: this.showParallel ? (this.isPhone || this.other ? '0' : this.destinationParallelLeft) : '100%'
      }
    },
    showParallel: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      }
    },
    showSelf: {
      get() {
        return !!this.self;
      },
      set(val) {
        this.$emit('update:self', val);
      }
    }
  },
  created() {
    this.$navigation.push(this);
  },
  beforeDestroy() {
    this.$navigation.pop();
  }
}
</script>

<style lang="css" scoped>
.mul-navigation {
  position: relative;
  width: 100%;
  height: 100vh;
}

.mul-navigation ::v-deep .mul-navigation {
  position: absolute;
  top: 0;
}

.mul-navigation .home,
.mul-navigation .nav-destination-wrapper {
  position: absolute;
  transition: all .2s ease;
  top: 0;
  height: 100%;
  box-sizing: border-box;
}

.mul-navigation .home ::v-deep .nav-title,
.mul-navigation .nav-destination-wrapper ::v-deep .nav-title {
  position: absolute;
}

.mul-navigation .nav-destination-wrapper {
  z-index: 2;
  background-color: #ffffff;
}
</style>
