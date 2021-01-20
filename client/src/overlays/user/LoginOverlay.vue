<template>
  <q-dialog
    v-model="isOpen"
    @keydown.enter="onSubmit"
  >
    <q-card
      class="q-px-lg q-py-lg"
      style="width: 400px"
    >
      <q-form
        ref="form"
        class="q-gutter-md"
      >
        <q-input
          v-model="username"
          standout
          dense
          label="用户名"
          lazy-rules
          :rules="[ val => val.length || '' ]"
        />

        <q-input
          v-model="password"
          type="password"
          standout
          dense
          label="密码"
          lazy-rules
          :rules="[ val => val.length || '' ]"
        />
        <q-toggle
          v-model="staySignedIn"
          label="保持登录"
        />

        <div class="q-gutter-y-md">
          <u-button
            label="登录"
            color="primary"
            class="full-width"
            :loading="isLogging"
            @click="onSubmit"
          />
          <u-button
            label="注册"
            color="positive"
            class="full-width"
            @click="onRegisterClick"
          />
          <u-button
            v-if="currentUser.id == -1"
            label="游客登录"
            color="orange"
            class="full-width"
            @click="onGuestLoginClick"
          />
          <u-button
            outline
            label="GitHub登录"
            class="full-width"
            :loading="isGitHubLogging"
            @click="onGitHubLoginClick"
          />
        </div>
      </q-form>
    </q-card>

    <create-user-overlay ref="createUserOverlay" />
  </q-dialog>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, reactive, Ref, ref, toRefs, watch,
} from '@vue/composition-api';
import { api, configManager } from 'src/boot/main';
import { githubOAuthUrl } from 'src/online/api/oauth';
import { ConfigItem } from 'src/config/ConfigManager';
import GuestUser from 'src/user/GuestUser';
import User from 'src/user/User';
import LogoutRequest from 'src/online/api/LogoutRequest';
import CreateUserOverlay from './CreateUserOverlay.vue';

export default defineComponent({
  components: { CreateUserOverlay },
  setup() {
    const { $refs } = getCurrentInstance() as Vue;
    const currentUser = api.localUser;
    const form = reactive({
      username: configManager.get(ConfigItem.username) as string,
      password: configManager.get(ConfigItem.password) as string,
      staySignedIn: configManager.get(ConfigItem.loginAuto) as boolean,
    });

    watch(form, () => {
      configManager.set(ConfigItem.loginAuto, form.staySignedIn);
      configManager.save();
    });

    const isOpen = ref(false);
    const isLogging = ref(false);
    const isGitHubLogging = ref(false);

    let action: (user: User, isLogging: Ref<boolean>) => void;
    let registerAction: (user: User, loading: Ref<boolean>, isOpen: Ref<boolean>) => void;
    const show = (options: {
      action: (user: User, isLogging: Ref<boolean>) => void,
      registerAction: (user: User, loading: Ref<boolean>, isOpen: Ref<boolean>) => void,
    }) => {
      action = options.action;
      registerAction = options.registerAction;
      isLogging.value = false;
      isGitHubLogging.value = false;
      isOpen.value = true;
    };

    const hide = () => {
      isOpen.value = false;
    };

    const onSubmit = () => {
      // eslint-disable-next-line
      (<any>$refs.form).validate().then((valid: boolean) => {
        if (!valid) return;
        const user = new User();
        user.username = form.username;
        user.password = form.password;
        action(user, isLogging);
      });
    };

    const onRegisterClick = () => {
      // eslint-disable-next-line
      (<any>$refs.createUserOverlay).show({
        action: (user: User, loading: Ref<boolean>, open: Ref<boolean>) => {
          registerAction(user, loading, open);
        },
      });
    };

    const onGuestLoginClick = () => {
      action(new GuestUser(), isLogging);
    };

    const onGitHubLoginClick = () => {
      isGitHubLogging.value = true;
      const callback = () => {
        api.logout();
        window.location.href = githubOAuthUrl;
      };
      if (!api.isLoggedIn) {
        callback();
        return;
      }
      const req = new LogoutRequest();
      req.success = callback;
      req.failure = callback;
      api.perform(req);
    };

    return {
      isOpen,
      show,
      hide,
      ...toRefs(form),
      currentUser,
      isLogging,
      isGitHubLogging,
      onSubmit,
      onGuestLoginClick,
      onRegisterClick,
      onGitHubLoginClick,
    };
  },
});
</script>
