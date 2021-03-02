<template>
  <q-btn
    flat
    dense
    no-caps
    :loading="loading"
    class="toolbar-button q-px-sm"
    @click="onUserButtonClick"
  >
    <div class="content flex items-center no-wrap">
      <span v-show="user.id != -1" class="nickname ellipsis">{{ user.nickname }}</span>
      <span v-show="user.id == -1">登录</span>
      <user-avatar
        v-show="user.id != -1"
        :user="user"
        size="28px"
        class="q-ml-xs"
      />
    </div>

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
  defineComponent, getCurrentInstance, reactive, Ref, ref,
} from '@vue/composition-api';
import { ConfigItem } from 'src/config/ConfigManager';
import LogoutRequest from 'src/online/api/LogoutRequest';
import RegisterRequest from 'src/online/api/RegisterRequest';
import APILoginResult from 'src/online/api/APILoginResult';
import User from 'src/user/User';
import UserAvatar from "src/user/components/UserAvatar.vue";
import { api, configManager } from 'src/boot/main';
import { APIState } from 'src/online/api/APIAccess';
import LoggedInUserOverlay from '../user/LoggedInUserOverlay.vue';
import LoginOverlay from '../user/LoginOverlay.vue';

export default defineComponent({
  components: { UserAvatar, LoginOverlay, LoggedInUserOverlay },
  setup(props, { emit }) {
    const { $refs, $q } = getCurrentInstance() as Vue;
    const user = reactive(api.localUser);
    const loading = ref(false);

    api.state.changed.add((state: APIState) => {
      loading.value = state == APIState.connecting;
      Object.assign(user, api.localUser);
    });

    const onUserButtonClick = () => {
      emit('click', props);
      if (api.isLoggedIn && api.localUser.id > 0) {
        return;
      }

      // eslint-disable-next-line
      (<any>$refs.loginOverlay).show({
        action: (loginUser: User, isLogging: Ref<boolean>) => {
          isLogging.value = true;

          const login = () => {
            loading.value = true;
            api.login(loginUser).then((ret: APILoginResult) => {
              isLogging.value = false;
              if (ret.code == 0) {
                // eslint-disable-next-line
                (<any>$refs.loginOverlay).hide();
              }
            }).catch(() => {
              isLogging.value = false;
            });
          };

          if (api.isLoggedIn) {
            loading.value = true;
            const req = new LogoutRequest();
            const callback = () => {
              api.logout();
              login();
            };
            req.success = callback;
            req.failure = callback;
            api.perform(req);
          } else {
            login();
          }
        },
        registerAction: (newUser: User, registerLoading: Ref<boolean>, isOpen: Ref<boolean>) => {
          const req = new RegisterRequest(newUser);
          req.loading = registerLoading;
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
              100: '该主机已被禁止注册',
            };
            $q.notify({
              type: (ret && ret.code == 100) ? 'negative' : 'warning',
              message: ret ? codeMsgMap[ret.code] : '注册失败',
            });
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
      loading,
      onUserButtonClick,
      onLogout,
    };
  },
});
</script>

<style lang="sass" scoped>
.content
  min-width: 80px
.nickname
  max-width: 120px
</style>
