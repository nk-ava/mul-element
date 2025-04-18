import MulNavigation from "./component/mul-navigation/mul-navigation.vue";
import NavDestination from "./component/nav-destination/nav-destination.vue";

export default {
    install(Vue, options) {
        if(!options?.getDevice) {
            throw new Error(`[mul-navigation] 缺少getDevice参数，请用mixins方式引入`);
        }
        // 自动引入iconfont样式
        import("./iconfont/iconfont.css").catch(err=>{
            throw new Error(`[mul-navigation] 自动引入iconfont样式失败， reason: ${err.messages}`);
        })
        // 全局储存mul-navigation实例
        Vue.prototype.$navigation = [];
        MulNavigation.mixins = [options.getDevice];
        // 全局引入组件
        Vue.component("NavDestination", NavDestination);
        Vue.component("MulNavigation", MulNavigation);
    }
}