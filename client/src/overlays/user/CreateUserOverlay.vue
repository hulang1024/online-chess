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

        <div class="q-gutter-y-md">
          <q-btn
            label="注册"
            color="positive"
            class="full-width"
            :loading="loading"
            @click="onSubmit"
          />
          <q-btn
            outline
            label="GitHub注册"
            class="full-width"
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
} from '@vue/composition-api';
import User from 'src/online/user/User';

export default defineComponent({
  setup() {
    const ctx = getCurrentInstance() as Vue;

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
      onGitHubLoginClick: () => {
        window.location.href = 'https://github.com/login/oauth/authorize?client_id=5176faf64742ae0bfe84';
      },
    };
  },
});
</script>
