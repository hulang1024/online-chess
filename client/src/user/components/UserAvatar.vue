<template>
  <q-avatar
    v-ripple
    v-bind="$attrs"
    class="user-avatar"
    :class="{offline}"
    :style="{backgroundColor}"
    @click="onClick"
  >
    <img
      v-if="avatarUrl"
      :src="avatarUrl"
      style="object-fit: cover;"
    >
    <span
      v-else
      class="text-white"
    >
      {{ id && id > 0 ? (nickname ? nickname.substring(0,1) : '') : '' }}
    </span>
  </q-avatar>
</template>

<script lang="ts">
import {
  computed,
  defineComponent, PropType, reactive, toRefs, watch,
} from "@vue/composition-api";
import User from "src/user/User";
import { USERNAME_COLORS } from './colors';

export default defineComponent({
  props: {
    user: Object as PropType<User>,
    online: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { emit, listeners }) {
    const NULL_USER = {
      id: null,
      nickname: '',
      avatarUrl: '',
      offline: false,
    };

    const states = reactive({
      ...NULL_USER,
      ...props.user,
      offline: !props.online,
    });

    const backgroundColor = computed(() => (
      (states.id && !states.avatarUrl)
        ? `#${USERNAME_COLORS[Math.abs(states.id) % USERNAME_COLORS.length].toString(16)}`
        : ''));

    watch(props, () => {
      Object.assign(states, props.user || NULL_USER);
      states.offline = !props.online;
    });

    const onClick = (event: Event) => {
      if (listeners.click) {
        event.stopPropagation();
      }
      emit('click');
    };

    return {
      backgroundColor,
      ...toRefs(states),

      onClick,
    };
  },
});
</script>

<style lang="sass" scoped>
.user-avatar
  transition: all 0.2s ease-out

.user-avatar.offline
  opacity: 0.2
</style>
