<template>
  <view class="nav-destination" :style="[{paddingTop: placeholderHeight+'px'}]">
    <nav-title :title="title" :value="true" @back="onBack" v-if="!hideTitle"></nav-title>
    <slot></slot>
  </view>
</template>
<script>
import NavTitle from "../nav-title/nav-title.vue";

export default {
  name: "NavDestination",
  components: {NavTitle},
  props: {
    title: {
      type: String,
      default: () => ""
    },
    hasBack: {
      type: Boolean,
      default: () => true
    },
    hideTitle: {
      type: Boolean,
      default: () => false
    },
    value: {
      type: Boolean
    }
  },
  methods: {
    onBack() {
      this.$emit('input', false)
    }
  },
  computed: {
    placeholderHeight() {
      return (getApp().globalData.statusBarHeight || 0) + (this.hideTitle ? 0 : 45)
    },
  }
}
</script>
<style scoped>
.nav-destination {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
</style>