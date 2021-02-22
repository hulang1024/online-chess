<template>
  <transition
    enter-active-class="animated fadeIn"
    leave-active-class="animated fadeOut"
    :duration="200"
  >
    <q-card
      v-show="visible"
      flat
      :class="`q-py-${$q.screen.xs ? 'xs' : 'sm'}`"
    >
      <span class="text-subtitle1">{{ _text }}</span>
    </q-card>
  </transition>
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
  width: calc(100% - 1px)
  background: rgba(0,0,0,0.35)
  color: white
  text-align: center
  border-radius: 2px
  user-select: none
  pointer-events: none

  span
    font-weight: bold
</style>
