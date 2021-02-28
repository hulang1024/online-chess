<template>
  <transition
    enter-active-class="animated fadeIn"
    leave-active-class="animated fadeOut"
    :duration="200"
  >
    <q-card
      v-show="_visible"
      flat
      :class="`q-py-${$q.screen.xs ? 'xs' : 'sm'}`"
    >
      <span class="text-subtitle1">{{ _text }}</span>
    </q-card>
  </transition>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from '@vue/composition-api';

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const _visible = ref<boolean>(props.visible);
    const _text = ref<string>(props.text);

    watch([() => props.visible, () => props.text], ([visible, text]) => {
      _visible.value = visible as boolean;
      _text.value = text as string;
    });

    const show = (text: string, duration = 0) => {
      _text.value = text;
      _visible.value = true;
      if (duration > 0) {
        setTimeout(() => {
          _visible.value = false;
        }, duration);
      }
    };

    const hide = () => {
      _visible.value = false;
    };

    return {
      _visible,
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
