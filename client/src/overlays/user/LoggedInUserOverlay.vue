<template>
  <q-menu>
    <div class="row no-wrap q-pa-md">
      <div class="column items-center">
        <user-avatar
          :user="user"
          size="72px"
        />

        <div class="text-subtitle1 q-mt-md q-mb-xs">
          {{ user.nickname }}
        </div>

        <q-btn
          color="negative"
          label="注销"
          dense
          class="full-width"
          v-close-popup
          @click="onLogoutClick"
        />
      </div>
    </div>
  </q-menu>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import UserAvatar from "src/user/components/UserAvatar.vue";

export default defineComponent({
  components: { UserAvatar },
  props: {
    user: null,
  },
  setup(props, { emit }) {
    const onLogoutClick = () => {
      emit('logout-action');
    };

    return {
      onLogoutClick,
    };
  },
});
</script>
