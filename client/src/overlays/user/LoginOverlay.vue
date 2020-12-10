<template>
  <q-dialog
    v-model="isOpen"
  >
    <q-card class="q-px-lg q-py-lg" style="width: 400px">
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
        <q-toggle v-model="staySignedIn" label="保持登录" />

        <div class="q-gutter-y-md">
          <q-btn
            label="登录"
            color="primary"
            class="full-width"
            :loading="isLogging"
            @click="onSubmit"
          />
          <q-btn
            label="注册"
            color="positive"
            class="full-width"
            @click="onRegisterClick"
          />
          <q-btn
            outline
            label="GitHub登录"
            class="full-width"
            @click="onGitHubLoginClick"
          />
        </div>
      </q-form>
    </q-card>

    <create-user-overlay ref="createUserOverlay" />
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, reactive, Ref, ref, toRefs, watch, watchEffect } from '@vue/composition-api';
import { ConfigItem } from 'src/config/ConfigManager';
import User from 'src/online/user/User';
import CreateUserOverlay from './CreateUserOverlay.vue';

export default defineComponent({
  components: { CreateUserOverlay },
  setup(props) {
    const ctx = getCurrentInstance();
    const { $refs, configManager } = <any>ctx;
    
    const user = reactive({
      username: configManager.get(ConfigItem.username),
      password: configManager.get(ConfigItem.password),
      staySignedIn: configManager.get(ConfigItem.loginAuto),
    });

    watch(user, () => {
      configManager.set(ConfigItem.loginAuto, user.staySignedIn);
      configManager.save();
    });

    const isOpen = ref(false);
    const isLogging = ref(false);

    let action: Function;
    let registerAction: Function;
    const show = (options: any) => {
      action = options.action;
      registerAction = options.registerAction;
      isLogging.value = false;
      isOpen.value = true;
    };

    const hide = () => {
      isOpen.value = false;
    };

    const onSubmit = () => {
      $refs.form.validate().then((valid: boolean) => {
        if (!valid) return;
        action(user, isLogging);
      });
    };

    const onRegisterClick = () => {
      $refs.createUserOverlay.show({
        action: (user: User, loading: Ref<boolean>, isOpen: Ref<boolean>) => {
          registerAction(user, loading, isOpen);
        }
      });
    };

    return {
      isOpen,
      show,
      hide,
      ...toRefs(user),
      isLogging,
      onSubmit,
      onRegisterClick,
      onGitHubLoginClick: () => {
        window.location.href = 'https://github.com/login/oauth/authorize?client_id=5176faf64742ae0bfe84';
      }
    };
  }
});
</script>