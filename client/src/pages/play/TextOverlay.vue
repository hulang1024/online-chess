<template>
  <q-card
    v-show="visible"
    transition-show="fade"
    transition-hide="fade"
    :class="[`q-py-${$q.screen.xs ? 'xs' : 'sm'}`, 'full-width']"
  >
    <span class="text-subtitle1">{{ _text }}</span>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';

export default defineComponent({
  setup() {
    const visible = ref<boolean>(false);
    const _text = ref<string>('');

    const show = (text: string, duration = 0) => {
      _text.value = text;
      visible.value = true;
      if (duration > 0) {
        setTimeout(() => {
          visible.value = false;
        }, duration);
      }
    };

    const hide = () => {
      visible.value = false;
    };

    return {
      visible,
      _text,
      show,
      hide,
    };
  },
});
</script>

<style lang="sass" scoped>
.q-card
  background: rgba(0,0,0,0.5)
  color: white
  text-align: center
</style>
