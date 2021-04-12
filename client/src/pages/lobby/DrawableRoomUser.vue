<template>
  <div :class="['room-user row items-center no-wrap', reverse && 'reverse']">
    <span
      class="nickname ellipsis"
      :class="reverse ? 'text-left' : 'text-right'"
    >{{ user.nickname }}</span>
    <user-avatar
      :user="user"
      size="30px"
      rounded
      class="shadow-1"
      :class="`q-m${reverse ? 'r' : 'l'}-xs`"
    >
      <chess-king-icon
        v-if="[1, 3].includes(gameType)"
        :chess="chess"
        :class="`absolute-bottom-${reverse ? 'left' : 'right'}`"
        :style="{[reverse ? 'left' : 'right']: '-18px'}"
      />
      <pure-chess-icon
        v-else
        :chess="chess"
        :class="`absolute-bottom-${reverse ? 'left' : 'right'}`"
        :style="{[reverse ? 'left' : 'right']: '-8px'}"
      />
    </user-avatar>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api';
import APIGameUser from 'src/online/play/APIGameUser';
import UserAvatar from 'src/user/components/UserAvatar.vue';
import ChessKingIcon from 'src/rulesets/chinesechess/ui/ChessKingIcon.vue';
import PureChessIcon from 'src/rulesets/gobang/ui/PureChessIcon.vue';

export default defineComponent({
  components: { UserAvatar, ChessKingIcon, PureChessIcon },
  props: {
    gameUser: Object as PropType<APIGameUser>,
    reverse: Boolean,
    gameType: Number,
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
  width: 90px
  font-size: 1.1em
</style>
