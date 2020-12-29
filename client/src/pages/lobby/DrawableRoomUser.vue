<template>
  <div :class="['row items-center', reverse && 'reverse']">
    <user-avatar
      :user="user"
      size="28px"
    />
    <span
      class="nickname ellipsis"
      :class="`q-m${reverse ? 'r' : 'l'}-xs`"
    >{{ nickname }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api';
import UserAvatar from 'src/user/components/UserAvatar.vue';
import User from 'src/user/User';

export default defineComponent({
  components: { UserAvatar },
  props: {
    user: Object as PropType<User>,
    reverse: Boolean,
  },
  setup(props) {
    return {
      ...props.user,
    };
  },
});
</script>

<style lang="sass" scoped>
.nickname
  max-width: 110px
  font-size: 1.1em
</style>
