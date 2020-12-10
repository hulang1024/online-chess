<template>
  <q-btn
    flat dense no-caps
    class="toolbar-button q-px-sm"
    :class="[user.id <= 0 && 'bg-black']"
    @click="onUserButtonClick"
  >
    <span>{{user.nickname}}</span>
    <span v-show="user.id <= 0">登录</span>
    <user-avatar v-show="user.id > 0" :user="user" size="28px" class="q-ml-xs"/>

    <logged-in-user-overlay
      v-if="user.id > 0"
      :user="user"
      @logout-action="onLogout"
    />

    <login-overlay ref="loginOverlay" />

  </q-btn>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, reactive, onMounted, Ref } from '@vue/composition-api'
import { ConfigItem } from 'src/config/ConfigManager';
import LogoutRequest from 'src/online/api/LogoutRequest';
import RegisterRequest from 'src/online/api/RegisterRequest';
import User from 'src/online/user/User';
import LoggedInUserOverlay from '../user/LoggedInUserOverlay.vue';
import LoginOverlay from '../user/LoginOverlay.vue';
import UserAvatar from "src/components/UserAvatar.vue";

export default defineComponent({
  components: { UserAvatar, LoginOverlay, LoggedInUserOverlay },
  setup() {
    const ctx = getCurrentInstance();
    let { api, configManager, $refs, $q } = <any>ctx;
    let user = reactive(api.localUser);

    api.isLoggedIn.changed.add((isLoggedIn: boolean) => {
      Object.assign(user, api.localUser);
    });

    const onUserButtonClick = () => {
      if (api.isLoggedIn.value) {
        return;
      }

      $refs.loginOverlay.show({
        action: (user: User, isLogging: Ref<boolean>) => {
          isLogging.value = true;
          api.login(user).then(() => {
            isLogging.value = false;
            $refs.loginOverlay.hide();
          }).catch(() =>  {
            isLogging.value = false;
          });
        },
        registerAction: (user: User, loading: Ref<boolean>, isOpen: Ref<boolean>) => {
          let req = new RegisterRequest(user);
          req.loading = loading;
          req.success = () => {
            $q.notify({type: 'positive', message: '注册成功'});
            isOpen.value = false;
          };
          req.failure = (ret) => {
            let codeMsgMap: any = {
              1: '注册失败', 
              2: '用户名已被使用',
              3: '用户名格式错误（允许1到20个字符）',
              4: '密码格式错误（允许至多20位）'};
            let message = ret ? codeMsgMap[ret.code] : '注册失败';
            $q.notify({type: 'warning', message });
          }
          api.perform(req);
        }
      });
    };

    const onLogout = () => {
      let req = new LogoutRequest();
      req.success = () => {
        configManager.set(ConfigItem.password, '');
        configManager.set(ConfigItem.token, '');
        configManager.save();
        api.logout();
      };
      api.perform(req);
    };

    return {
      user,
      onUserButtonClick,
      onLogout
    }
  }
});
</script>

<style scoped>
.q-btn {
  min-width: 80px;
}
</style>