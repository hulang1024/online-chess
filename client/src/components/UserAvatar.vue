<template>
  <q-avatar
    v-bind="$attrs"
    class="user-avatar"
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
  defineComponent, PropType, reactive, toRefs, watch,
} from "@vue/composition-api";
import User from "src/online/user/User";

export default defineComponent({
  props: {
    user: Object as PropType<User>,
  },
  setup(props) {
    const NULL_USER = {
      id: null,
      nickname: '',
      avatarUrl: '',
    };

    const user = reactive({
      ...NULL_USER,
      ...props.user,
    });

    watch(props, () => {
      Object.assign(user, props.user || NULL_USER);
    });

    return {
      ...toRefs(user),
    };
  },
});
</script>
