<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { Notify } from 'quasar';
import Vue from 'vue';
import ConfigManager, { ConfigItem } from './config/ConfigManager';
import APIAccess from './online/api/APIAccess';
import ChannelManager from './online/chat/ChannelManager';
import User from './online/user/User';
import SocketService from './online/ws/SocketService';

function start(
  configManager: ConfigManager,
  channelManager: ChannelManager,
  api: APIAccess,
  socketService: SocketService) {
  if (location.hash.substring('#/'.length)) {
    let matchRet = location.hash.match(/status=(\d)/);
    let status = matchRet ? matchRet[1] : 1;
    if (status == '0') {
      // 第三方登录
      matchRet = location.hash.match(/token=(.+)/)
      let token = matchRet ? matchRet[1] : null;
      if (token) {
        api.login(null, token);
        location.hash = '';
        return;
      }
    } else if (matchRet) {
      location.hash = '';
      Notify.create({type: 'warning', message: '登录失败'});
    }
  }
  if (configManager.get(ConfigItem.loginAuto)) {
    let user = new User();
    user.username = configManager.get(ConfigItem.username);
    user.password = configManager.get(ConfigItem.password);
    let token = configManager.get(ConfigItem.token);
    if ((user.username && user.password) || token) {
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
    let { configManager, channelManager, api, socketService } = Vue.prototype;
    start(configManager, channelManager, api, socketService);
  }
});
</script>
<style scoped>
#q-app {
  background: #efefef;
}
</style>