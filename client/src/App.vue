<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance } from '@vue/composition-api';
import { Notify } from 'quasar';
import Vue from 'vue';
import VueRouter from 'vue-router';
import { configManager, api, socketService } from './boot/main';
import { ConfigItem } from './config/ConfigManager';
import User from './online/user/User';

function start(router: VueRouter) {
  if (window.location.hash.substring('#/?'.length)) {
    let matchRet = new RegExp('status=(\\d)').exec(window.location.hash);
    const status = matchRet ? matchRet[1] : 1;
    if (status == '0') {
      // 第三方登录
      matchRet = new RegExp('token=(.+)').exec(window.location.hash);
      const token = matchRet ? matchRet[1] : null;
      if (token) {
        // eslint-disable-next-line
        api.login(null, token);
        // eslint-disable-next-line
        router.push('/');
        return;
      }
    } else if (matchRet) {
      // eslint-disable-next-line
      router.push('/');
      Notify.create({ type: 'warning', message: '登录失败' });
    }
  }
  if (configManager.get(ConfigItem.loginAuto)) {
    const user = new User();
    user.username = configManager.get(ConfigItem.username) as string;
    user.password = configManager.get(ConfigItem.password) as string;
    const token = configManager.get(ConfigItem.token) as string;
    if ((user.username && user.password) || token) {
      // eslint-disable-next-line
      api.login(user, token);
    } else {
      socketService.doConnect();
    }
  } else {
    socketService.doConnect();
  }
}

export default defineComponent({
  name: 'App',
  setup() {
    const context = getCurrentInstance() as Vue;

    context.$q.dark.set(configManager.get(ConfigItem.theme) == 'dark');
    start(context.$router);

    document.addEventListener('visibilitychange', () => {
      socketService.queue((send) => {
        const hide = document.hidden;
        send(`user_activity.${hide ? 'enter' : 'exit'}`, { code: 0 });
      });
    });
  },
});
</script>
<style scoped>
#q-app {
  background: #efefef;
}
</style>
