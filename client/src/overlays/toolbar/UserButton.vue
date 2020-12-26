<template>
  <q-btn
    flat
    dense
    no-caps
    class="toolbar-button q-px-sm"
    @click="onUserButtonClick"
  >
    <span v-show="user.id != -1">{{ user.nickname }}</span>
    <span v-show="user.id == -1">登录</span>
    <user-avatar
      v-show="user.id != -1"
      :user="user"
      size="28px"
      class="q-ml-xs"
    />

    <logged-in-user-overlay
      v-if="user.id > 0"
      :user="user"
      @logout-action="onLogout"
    />

    <login-overlay ref="loginOverlay" />
  </q-btn>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, reactive, Ref,
} from '@vue/composition-api';
import { ConfigItem } from 'src/config/ConfigManager';
import LogoutRequest from 'src/online/api/LogoutRequest';
import RegisterRequest from 'src/online/api/RegisterRequest';
import User from 'src/user/User';
import UserAvatar from "src/user/components/UserAvatar.vue";
import { api, configManager } from 'src/boot/main';
import LoggedInUserOverlay from '../user/LoggedInUserOverlay.vue';
import LoginOverlay from '../user/LoginOverlay.vue';

export default defineComponent({
  components: { UserAvatar, LoginOverlay, LoggedInUserOverlay },
  setup(props, { emit }) {
    const { $refs, $q } = getCurrentInstance() as Vue;
    const user = reactive(api.localUser);

    api.isLoggedIn.changed.add(() => {
      Object.assign(user, api.localUser);
    });

    const onUserButtonClick = () => {
      emit('click', props);
      if (api.isLoggedIn.value && api.localUser.id > 0) {
        return;
      }

      // eslint-disable-next-line
      (<any>$refs.loginOverlay).show({
        action: (loginUser: User, isLogging: Ref<boolean>) => {
          isLogging.value = true;
          api.login(loginUser).then(() => {
            isLogging.value = false;
            // eslint-disable-next-line
            (<any>$refs.loginOverlay).hide();
          }).catch(() => {
            isLogging.value = false;
          });
        },
        registerAction: (newUser: User, loading: Ref<boolean>, isOpen: Ref<boolean>) => {
          const req = new RegisterRequest(newUser);
          req.loading = loading;
          req.success = () => {
            $q.notify({ type: 'positive', message: '注册成功' });
            isOpen.value = false;
          };
          req.failure = (ret) => {
            const codeMsgMap: {[code: number]: string} = {
              1: '注册失败',
              2: '用户名已被使用',
              3: '用户名格式错误（允许1到20个字符）',
              4: '密码格式错误（允许至多20位）',
            };
            $q.notify({ type: 'warning', message: ret ? codeMsgMap[ret.code] : '注册失败' });
          };
          api.perform(req);
        },
      });
    };

    const onLogout = () => {
      const req = new LogoutRequest();
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
      onLogout,
    };
  },
});
</script>

<style scoped>
.q-btn {
  min-width: 80px;
}
</style>
