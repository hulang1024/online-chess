<template>
  <div :class="['row', reverse && 'reverse']">
    <user-avatar :user="user" size="28px" class="q-ml-xs" />
    <span class="q-ml-xs">{{nickname}}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, Ref, toRef, toRefs } from '@vue/composition-api'
import UserAvatar from 'src/components/UserAvatar.vue';
import User from 'src/online/user/User';

export default defineComponent({
  components: { UserAvatar },
  props: {
    user: Object as PropType<User>,
    reverse: Boolean
  },
  setup(props) {
    return {
      ...props.user
    };
  }
});
</script>