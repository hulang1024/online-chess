<template>
  <q-avatar
    v-bind="$attrs"
    class="user-avatar"
    :class="{offline: !online}"
    :style="{backgroundColor}"
  >
    <img
      v-if="avatarUrl"
      :src="avatarUrl"
    >
    <span v-else>{{ nickname ? nickname.substring(0,1) : '' }}</span>
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
  setup(props) {
    const NULL_USER = {
      id: null,
      nickname: '',
      avatarUrl: '',
      isOnline: false,
    };

    const states = reactive({
      ...NULL_USER,
      ...props.user,
      online: props.online,
    });

    const backgroundColor = computed(() => ((states.id && !states.avatarUrl)
      ? `#${USERNAME_COLORS[states.id % USERNAME_COLORS.length].toString(16)}`
      : ''));

    watch(props, () => {
      Object.assign(states, props.user || NULL_USER);
      states.online = props.online;
    });

    return {
      backgroundColor,
      ...toRefs(states),
    };
  },
});
</script>

<style lang="sass" scoped>
.user-avatar
  transition: all 0.2s ease-out

.user-avatar.offline
  filter: grayscale(90%)
</style>
