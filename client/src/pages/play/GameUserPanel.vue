<template>
  <div
    class="game-user-panel column no-wrap"
    :class="[$q.screen.xs && 'xs-screen', {active}]"
  >
    <div
      class="row justify-between avatar-time-row"
      :class="{reverse}"
    >
      <div
        class="user-avatar-frame"
        :class="[
          {active},
          $q.screen.xs
            ? 'light'
            : $q.dark.isActive ? 'light' : 'dark'
        ]"
        :blink="blinkState"
      >
        <user-avatar
          :user="user"
          :online="online"
          :class="{
            afk: user && (status == UserStatus.AFK),
            'shadow-2': !!user
          }"
          rounded
          size="60px"
          @click="onUserAvatarClick"
        >
          <ready-status-display
            v-if="user && showReadyStatus"
            :is-ready="ready"
            class="info-overlay absolute-center"
          />
          <div
            v-show="emojiShow"
            class="emoji-background absolute-center"
          />
        </user-avatar>
        <div
          ref="emojiRef"
          class="emoji absolute-center"
          :class="{show: emojiShow}"
        >
          <span>{{ emoji }}</span>
        </div>
        <div
          v-show="user && (status == UserStatus.AFK || !online)"
          :class="['user-status', `absolute-bottom-${reverse ? 'right' : 'left'}`]"
        >
          <span>({{ online ? '离开' : '离线' }})</span>
        </div>
      </div>
      <div
        v-show="user"
        class="column time-panel"
        :class="[`q-m${reverse ? 'r' : 'l'}-sm`]"
      >
        <div class="item">
          <span class="label">步时</span>
          <timer ref="stepTimer" />
        </div>
        <div class="item">
          <span class="label">局时</span>
          <timer ref="gameTimer" />
        </div>
        <template v-if="$q.screen.xs">
          <!-- todo: 消除硬编码 -->
          <chess-king-icon
            v-if="[1, 3].includes(gameType)"
            :chess="chess"
            :class="['chess', reverse ? 'absolute-right center' : 'absolute-left center']"
          />
          <pure-chess-icon
            v-else
            :chess="chess"
            :class="['chess', reverse ? 'absolute-right center' : 'absolute-left center']"
          />
        </template>
      </div>
    </div>
    <div
      class="row items-center"
      :class="{reverse}"
    >
      <div
        v-if="!$q.screen.xs"
        class="nickname ellipsis"
        :style="{textAlign: reverse ? 'right' : 'left'}"
      >
        {{ user && user.nickname }}
      </div>
      <template v-if="user && !$q.screen.xs">
        <!-- todo: 消除硬编码 -->
        <chess-king-icon
          v-if="[1, 3].includes(gameType)"
          :chess="chess"
          :class="['chess', {active}]"
        />
        <pure-chess-icon
          v-else
          :chess="chess"
          :class="['chess', {active}]"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, PropType, ref,
} from "@vue/composition-api";
import UserAvatar from "src/user/components/UserAvatar.vue";
import User from "src/user/User";
import UserStatus from "src/user/UserStatus";
import ChessHost from "src/rulesets/chess_host";
import ChessKingIcon from "src/rulesets/chinesechess/ui/ChessKingIcon.vue";
import PureChessIcon from "src/rulesets/gobang/ui/PureChessIcon.vue";
import { GameType } from "src/rulesets/GameType";
import Timer from "../../rulesets/ui/timer/Timer.vue";
import ReadyStatusDisplay from "./ReadyStatusDisplay.vue";

export default defineComponent({
  components: {
    UserAvatar,
    Timer,
    ReadyStatusDisplay,
    ChessKingIcon,
    PureChessIcon,
  },
  props: {
    user: Object as PropType<User>,
    online: Boolean,
    ready: Boolean,
    status: Number as PropType<UserStatus>,
    chess: Number as PropType<ChessHost | undefined>,
    active: Boolean,
    showReadyStatus: Boolean,
    reverse: Boolean,
    gameType: Number as PropType<GameType>,
  },
  inject: ['showUserDetails'],
  setup(props) {
    const context = getCurrentInstance() as Vue;

    const onUserAvatarClick = () => {
      if (!props.user) {
        return;
      }
      // eslint-disable-next-line
      (context as any).showUserDetails(props.user);
    };

    const blinkState = ref(false);

    const blink = () => {
      blinkState.value = true;
      setTimeout(() => {
        blinkState.value = false;
      }, 200 * 3);
    };

    const emoji = ref('');
    const emojiShow = ref(false);
    let emojiTimer: NodeJS.Timeout | null = null;

    const showEmoji = (s: string) => {
      if (emojiTimer) {
        clearTimeout(emojiTimer);
        emojiTimer = null;
      }
      emoji.value = s;
      emojiShow.value = true;
      emojiTimer = setTimeout(() => {
        emojiShow.value = false;
      }, 1500);
    };

    return {
      UserStatus,

      blink,
      blinkState,

      showEmoji,
      emojiShow,
      emoji,

      onUserAvatarClick,
    };
  },
});
</script>

<style lang="sass" scoped>
.game-user-panel:not(.xs-screen)
  transition: box-shadow 0.1s ease-out
  box-shadow: 1px 1px 4px 1px rgb(0, 0, 0, 0.05)

  &.active
    box-shadow: 1px 1px 4px 4px rgb(0, 0, 0, 0.1)

.nickname
  flex-grow: 1
  font-size: 1.1em
  font-weight: 400
  text-align: center

.chess-host
  &::before
    content: '('
  &::after
    content: ')'

.user-avatar-frame
  position: relative
  border-radius: 6px
  transition: all 0.2s ease-out
  animation-duration: 1.25s
  animation-timing-function: linear
  animation-iteration-count: infinite

  .user-avatar
    border-radius: inherit
    &.afk
      opacity: 0.6 !important

  &.active.light
    animation-name: animation-user-avatar-frame-active-light

  &.active.dark
    animation-name: animation-user-avatar-frame-active-dark

  .user-status
    padding: 2px 6px
    background: rgba(0, 0, 0, 0.3)
    width: 100%
    border-radius: inherit
    border-top-left-radius: 0px
    border-top-right-radius: 0px
    font-size: 12px
    color: #fff
    text-align: center

  .info-overlay
    width: 100%
    height: 100%
    display: flex
    justify-content: center
    align-items: center
    font-size: 14px
    background: rgba(0,0,0,0.3)
    border-radius: inherit
    transition: all 0.2s ease

.time-panel
  position: relative
  display: flex
  flex-wrap: nowrap
  justify-content: space-evenly
  min-width: 86px

  .item
    display: flex
    flex-wrap: nowrap
    justify-content: space-evenly
    user-select: none
    font-size: 14px

    .label
      word-break: keep-all
      &::after
        content: ':'

    .time
      font-weight: 500

.chess
  transition: all 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28)

  &.active
    transform: scale(1.3)

.emoji-background
  width: 100%
  height: 100%
  background: rgba(0,0,0,0.3)
  border-radius: inherit

.emoji
  z-index: 2
  position: absolute
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.3)
  text-align: center
  opacity: 0
  transition: opacity 0.1s, font-size 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)
  font-size: 30px

  span
    top: 3px
    position: relative

  &.show
    opacity: 1
    font-size: 60px

.xs-screen
  .avatar-time-row
    align-items: center

  .time-panel
    min-width: 140px
    padding: 2px 4px
    background: rgba(0, 0, 0, 0.2)
    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.1)
    border-radius: 4px

.center
  &.absolute-right,
  &.absolute-left
    top: 50%
    transform: translateY(-50%)
</style>
<style>
@keyframes animation-user-avatar-frame-active-light {
  0% {
    box-shadow: 0px 0px 1px 1px rgba(255, 241, 118, 0.5)
  }
  50% {
    box-shadow: 0px 0px 4px 5px rgba(255, 241, 118, 1)
  }
  100% {
    box-shadow: 0px 0px 1px 1px rgba(255, 241, 118, 0.5)
  }
}

@keyframes animation-user-avatar-frame-active-dark {
  0% {
    box-shadow: 0px 0px 1px 1px rgba(251, 192, 45, 0.3)
  }
  50% {
    box-shadow: 0px 0px 4px 5px rgba(251, 192, 45, 1)
  }
  100% {
    box-shadow: 0px 0px 1px 1px rgba(251, 192, 45, 0.3)
  }
}
</style>
