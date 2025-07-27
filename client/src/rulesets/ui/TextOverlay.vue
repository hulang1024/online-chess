<template>
  <transition
    enter-active-class="animated fadeIn"
    leave-active-class="animated fadeOut"
    :duration="200"
  >
    <q-card
      v-show="_visible"
      :class="`q-py-${$q.screen.xs ? 'xs' : 'sm'}`"
    >
      <span class="text-subtitle1">{{ _text }}</span>
    </q-card>
  </transition>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      required: false,
    },
    text: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    const _visible = ref<boolean>(props.visible as unknown as boolean);
    const _text = ref<string>(props.text as unknown as string);

    watch([() => props.visible, () => props.text], ([visible, text]) => {
      _visible.value = !!visible;
      _text.value = text as unknown as string;
    });

    let timer: NodeJS.Timeout | null = null;
    const show = (text: string, duration = 0) => {
      if (timer) {
        clearTimeout(timer);
      }
      _text.value = text;
      _visible.value = true;
      if (duration > 0) {
        timer = setTimeout(() => {
          _visible.value = false;
          timer = null;
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
  background: rgba(0,0,0,0.5)
  box-shadow: 0px 3px 6px 0px rgba(30, 30, 30, 0.4)
  color: white
  text-align: center
  border-radius: 4px
  user-select: none
  pointer-events: none

  span
    font-weight: bold
</style>
