<template>
  <view class="nav-title" :style="'padding-top: '+topSafeHeight+'px'">
    <i class="iconfont icon-fenxiang" @tap="onBack"></i>
    <text :class="['title', position]">{{ title }}</text>
    <slot></slot>
  </view>
</template>

<script>
export default {
  name: "NavTitle",
  props: {
    title: {
      type: String,
      default: () => ""
    },
    position: {
      type: String,
      default: () => "start"
    },
    value: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      topSafeHeight: getApp().globalData.statusBarHeight || 0
    }
  },
  methods: {
    onBack() {
      this.value ? this.$emit('back') : uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.nav-title {
  position: fixed;
  top: 0;
  display: flex;
  align-items: center;
  padding: 0 5px;
  justify-content: space-between;
  height: 45px;
  width: calc(100% - 10px);
}

.nav-title .title {
  position: absolute;
  text-align: center;
  color: #000000;
}

.nav-title .title.start {
  left: 45px;
}

.nav-title .title.center {
  left: 0;
  right: 0;
}

.nav-title .iconfont {
  font-size: 28px;
  z-index: 1;
}
</style>
