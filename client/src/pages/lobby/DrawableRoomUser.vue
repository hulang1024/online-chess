<template>
  <div :class="['row items-center', reverse && 'reverse']">
    <user-avatar
      :user="user"
      size="28px"
    />
    <span
      class="nickname ellipsis"
      :class="`q-m${reverse ? 'r' : 'l'}-xs`"
    >{{ user.nickname }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api';
import APIGameUser from 'src/online/play/APIGameUser';
import UserAvatar from 'src/user/components/UserAvatar.vue';

export default defineComponent({
  components: { UserAvatar },
  props: {
    gameUser: Object as PropType<APIGameUser>,
    reverse: Boolean,
  },
  setup(props) {
    return {
      ...props.gameUser,
    };
  },
});
</script>

<style lang="sass" scoped>
.nickname
  max-width: 110px
  font-size: 1.1em
</style>
