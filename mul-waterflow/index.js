import MulWaterflow from "./mul-waterflow.vue";

export default {
    install(Vue, options) {
        if (!options?.getDevice) {
            throw new Error(`[mul-waterflow] 缺少getDevice参数，请用mixins方式引入`);
        }
        MulWaterflow.mixin = [options.getDevice];
        Vue.component('MulWaterflow', MulWaterflow);
    }
}