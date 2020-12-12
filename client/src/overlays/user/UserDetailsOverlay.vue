<template>
  <q-dialog
    v-model="isOpen"
    transition-show="slide-up"
    transition-hide="slide-down"
    flat
    content-class="user-details-overlay z-top"
  >
    <q-card
      flat
      class="q-px-sm bg-white full-width"
    >
      <div v-if="user">
        <span>ID: </span>
        <span>{{ user.id }}</span>
      </div>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';
import User from 'src/online/user/User';

export default defineComponent({
  setup() {
    const _user = ref(null);
    const isOpen = ref(false);

    const hide = () => {
      isOpen.value = false;
    };

    const show = (user: User) => {
      _user.value = user;
      isOpen.value = true;
    };

    return {
      show,
      hide,
      isOpen,

      user: _user,
    };
  },
});
</script>
