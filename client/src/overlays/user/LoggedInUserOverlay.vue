<template>
  <q-menu z-top>
    <div
      class="column items-center q-py-lg"
      style="min-width: 140px"
    >
      <div class="column items-center">
        <div class="text-subtitle1 q-mb-sm">
          {{ _user.nickname }}
        </div>
        <user-avatar
          :user="_user"
          size="72px"
          class="shadow-2"
          @click="onAvatarClick"
        />

        <q-btn
          :loading="uploading"
          label="修改"
          outline
          class="full-width q-mt-md"
          @click="onEditAvatarClick"
        />

        <input
          ref="fileUpload"
          type="file"
          accept="image/*"
          style="display:none"
          @change="onAvatarFileUploadChange"
        >

        <q-btn
          color="negative"
          label="注销"
          dense
          class="full-width q-mt-md"
          v-close-popup
          @click="onLogoutClick"
        />
      </div>
    </div>
  </q-menu>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, reactive, ref,
} from '@vue/composition-api';
import { api } from 'src/boot/main';
import UserAvatar from "src/user/components/UserAvatar.vue";
import UploadAvatarRequest from 'src/online/user/UploadAvatarRequest';
import User from 'src/user/User';

export default defineComponent({
  components: { UserAvatar },
  inject: ['showUserDetails'],
  props: {
    user: null,
  },
  setup(props, { emit }) {
    const user = reactive<User>(props.user);

    const ctx = getCurrentInstance() as Vue;

    const uploading = ref(false);

    const onAvatarClick = () => {
      // eslint-disable-next-line
      (ctx as any).showUserDetails(props.user);
    };

    const onLogoutClick = () => {
      emit('logout-action');
    };

    const onEditAvatarClick = () => {
      // eslint-disable-next-line
      (ctx.$refs.fileUpload as any).click();
    };

    const onAvatarFileUploadChange = () => {
      // eslint-disable-next-line
      const file = (ctx.$refs.fileUpload as any).files[0];

      const req = new UploadAvatarRequest(file);
      req.loading = uploading;
      req.success = (res) => {
        user.avatarUrl = res.url;
        ctx.$q.notify({ type: 'positive', message: '修改成功' });
      };
      req.failure = () => {
        ctx.$q.notify({ type: 'warning', message: '对不起，修改失败' });
      };
      api.perform(req);
    };

    return {
      _user: user,
      uploading,
      onAvatarClick,
      onEditAvatarClick,
      onAvatarFileUploadChange,
      onLogoutClick,
    };
  },
});
</script>
