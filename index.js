import MulWaterflow from "./mul-waterflow/mul-waterflow.vue";
import MulNavigation from "./mul-navigation/component/mul-navigation/mul-navigation.vue";
import NavDestination from "./mul-navigation/component/nav-destination/nav-destination.vue";
import MulImagePreview from "./mul-image-preview/image-preview.vue";

const components = [
    MulNavigation,
    NavDestination,
    MulWaterflow
]

export default {
    install(Vue, options) {
        if(!options?.getDevice) {
            throw new Error(`[mul-element] 缺少getDevice参数，请用mixins方式引入`);
        }
        import("./mul-navigation/iconfont/iconfont.css").catch(err=>{
            throw new Error(`[mul-navigation] 自动引入iconfont样式失败， reason: ${err.messages}`);
        })
        Vue.prototype.$navigation = [];
        // 所有组件混入device
        components.forEach(item => {
            item.mixins = [options.getDevice];
            Vue.component(item.name, item);
        });
    }
}

export {
    MulNavigation,
    MulWaterflow,
    MulImagePreview
}