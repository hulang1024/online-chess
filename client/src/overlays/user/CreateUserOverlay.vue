<template>
  <q-dialog
    v-model="isOpen"
  >
    <q-card
      class="q-px-lg q-py-lg"
      style="width: 400px"
    >
      <q-form
        ref="form"
        class="q-gutter-xs"
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

        <div class="q-pt-md q-gutter-y-lg">
          <u-button
            label="注册"
            color="positive"
            class="full-width"
            :loading="loading"
            @click="onSubmit"
          />
          <u-button
            outline
            label="GitHub注册"
            class="full-width"
            :loading="loading"
            @click="onGitHubLoginClick"
          />
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, reactive, Ref, ref, toRefs,
} from 'vue';
import User from 'src/user/User';
import { githubOAuthUrl } from 'src/online/api/oauth';
import { api } from 'src/boot/main';
import LogoutRequest from 'src/online/api/LogoutRequest';

export default defineComponent({
  setup() {
    const ctx = getCurrentInstance()!.proxy as unknown as Vue;

    const form = reactive({
      username: '',
      password: '',
    });
    const isOpen = ref(false);
    const loading = ref(false);

    let action: (user: User, loading: Ref<boolean>, isOpen: Ref<boolean>) => void;
    const show = (options: any) => {
      // eslint-disable-next-line
      action = options.action;
      loading.value = false;
      isOpen.value = true;
    };

    const hide = () => {
      isOpen.value = false;
    };

    const onGitHubLoginClick = () => {
      loading.value = true;
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

    const onSubmit = () => {
      // eslint-disable-next-line
      (<any>ctx?.$refs.form).validate().then((valid: boolean) => {
        if (!valid) return;
        const user = new User();
        user.username = form.username;
        user.password = form.password;
        action(user, loading, isOpen);
      });
    };

    return {
      isOpen,
      show,
      hide,
      ...toRefs(form),
      loading,
      onSubmit,
      onGitHubLoginClick,
    };
  },
});
</script>
