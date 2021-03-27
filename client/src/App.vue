<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance, onMounted } from '@vue/composition-api';
import { Notify } from 'quasar';
import Vue from 'vue';
import VueRouter from 'vue-router';
import User from 'src/user/User';
import {
  configManager, api, socketService, userManager,
} from './boot/main';
import { ConfigItem } from './config/ConfigManager';
import GuestUser from './user/GuestUser';
import APILoginResult from './online/api/APILoginResult';

async function start(router: VueRouter) {
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
        router.replace('/');
        return;
      }
    } else if (matchRet) {
      // eslint-disable-next-line
      router.replace('/');
      Notify.create({ type: 'warning', message: '登录失败' });
    }
  }

  let loginResult: APILoginResult | undefined;
  if (configManager.get(ConfigItem.loginAuto)) {
    const user = new User();
    user.username = configManager.get(ConfigItem.username) as string;
    user.password = configManager.get(ConfigItem.password) as string;
    const token = configManager.get(ConfigItem.token) as string;
    if ((user.username && user.password) || token) {
      loginResult = await api.login(user, token).catch(() => undefined);
    }
  }

  if (!loginResult || loginResult?.code != 0) {
    await api.login(new GuestUser());
  }
}

export default defineComponent({
  name: 'App',
  setup() {
    const context = getCurrentInstance() as Vue;

    userManager.userOnline.add((user: number, nickname: string) => {
      Notify.create(`已上线：${nickname}`);
    });
    userManager.userOffline.add((uid: number, nickname: string) => {
      Notify.create(`已下线：${nickname}`);
    });

    context.$q.dark.set(configManager.get(ConfigItem.darkMode) as boolean);

    onMounted(() => {
      // eslint-disable-next-line
      start(context.$router);
    });
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
  background: #f2f3f7;
}
</style>
