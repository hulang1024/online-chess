import { route } from 'quasar/wrappers';
import { api } from 'src/boot/main';
import VueRouter, { Route } from 'vue-router';
import routes from './routes';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

export default route(({ Vue }) => {
  Vue.use(VueRouter);

  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as is and change from quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE,
  });

  Router.beforeEach((to, from, next) => {
    if (to.path !== '/') {
      if (!api.isLoggedIn) {
        next({ path: '/' });
      } else {
        next();
      }
    } else {
      next();
    }
  });

  return Router;
});

declare module 'vue/types/vue' {
  interface Vue {
    $router: VueRouter
    $route: Route
  }
}
