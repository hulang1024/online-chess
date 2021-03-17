<template>
  <div
    class="game-user-panel column no-wrap"
    :class="[$q.screen.xs && 'xs-screen']"
  >
    <div
      class="row justify-between avatar-time-row"
      :class="{reverse}"
    >
      <div
        class="user-avatar-frame"
        :class="{[config.activeClass]: active}"
        :blink="blinkState"
        :color="config.timerColor"
      >
        <user-avatar
          :user="user"
          :online="online"
          :class="{
            afk: user && (status == UserStatus.AFK),
            'shadow-1': !!user && !active
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
        </user-avatar>
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
      </div>
    </div>
    <div
      class="row items-center q-mt-sm"
      :class="{reverse}"
    >
      <div
        v-if="!$q.screen.xs"
        class="nickname ellipsis"
        :style="{textAlign: reverse ? 'right' : 'left'}"
      >
        {{ user && user.nickname }}
      </div>
      <div
        v-if="!$q.screen.xs && config.chessColor"
        class="chess"
        :style="{backgroundColor: config.chessColor}"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed, defineComponent, getCurrentInstance, PropType, ref,
} from "@vue/composition-api";
import UserAvatar from "src/user/components/UserAvatar.vue";
import User from "src/user/User";
import UserStatus from "src/user/UserStatus";
import ChessHost from "src/rulesets/chess_host";
import { GameType } from "src/rulesets/GameType";
import Timer from "../../rulesets/ui/timer/Timer.vue";
import ReadyStatusDisplay from "./ReadyStatusDisplay.vue";

export default defineComponent({
  components: {
    UserAvatar,
    Timer,
    ReadyStatusDisplay,
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

    const config = computed(() => {
      const GAME_TYPE_CONFIG_MAP = {
        [GameType.chinesechess]: {
          chessColor: {
            [ChessHost.FIRST]: 'red',
            [ChessHost.SECOND]: 'black',
          },
          activeClass: {
            [ChessHost.FIRST]: 'red',
            [ChessHost.SECOND]: 'black',
          },
          chessName: {
            [ChessHost.FIRST]: '红',
            [ChessHost.SECOND]: '黑',
          },
          timerColor: null,
          showChess: false,
        },
        [GameType.chinesechessDark]: {
          chessColor: {
            [ChessHost.FIRST]: 'red',
            [ChessHost.SECOND]: 'black',
          },
          activeClass: {
            [ChessHost.FIRST]: 'red',
            [ChessHost.SECOND]: 'black',
          },
          chessName: {
            [ChessHost.FIRST]: '红',
            [ChessHost.SECOND]: '黑',
          },
          timerColor: null,
          showChess: false,
        },
        [GameType.gobang]: {
          chessColor: {
            [ChessHost.FIRST]: 'black',
            [ChessHost.SECOND]: 'white',
          },
          activeClass: {
            [ChessHost.FIRST]: 'chess-active',
            [ChessHost.SECOND]: 'chess-active',
          },
          chessName: {
            [ChessHost.FIRST]: '黑',
            [ChessHost.SECOND]: '白',
          },
          timerColor: {
            [ChessHost.FIRST]: context.$q.dark.isActive ? 'black' : 'light-green',
            [ChessHost.SECOND]: context.$q.dark.isActive ? 'white' : 'light-green',
          },
          showChess: true,
        },
      };

      const cfg = GAME_TYPE_CONFIG_MAP[props.gameType as GameType];
      const chessColor = cfg.chessColor[props.chess as ChessHost];
      const timerColor = cfg.timerColor
        ? cfg.timerColor[props.chess as ChessHost]
        : chessColor;
      return {
        timerColor: ((props.user && props.active)
          ? timerColor
          : 'transparent'),
        chessName: props.user && cfg.chessName[props.chess as ChessHost],
        showChess: cfg.showChess,
        chessColor: (props.user && cfg.showChess) ? chessColor : null,
        activeClass: cfg.activeClass[props.chess as ChessHost],
      };
    });

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

    return {
      UserStatus,
      config,

      blink,
      blinkState,

      onUserAvatarClick,
    };
  },
});
</script>

<style lang="sass" scoped>
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
  border-radius: 4px
  transition: all 0.2s ease-out
  animation-duration: 2s
  animation-timing-function: linear
  animation-iteration-count: infinite

  .user-avatar
    &.afk
      opacity: 0.6 !important

  &.red
    animation-name: user-avatar-frame-red

  &.black
    animation-name: user-avatar-frame-black

  &.chess-active
    animation-name: user-avatar-frame-active

  .user-status
    padding: 2px
    background: rgba(0, 0, 0, 0.3)
    border-radius: 2px
    font-size: 12px
    color: #fff

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

.xs-screen
  .avatar-time-row
    align-items: center

  .time-panel
    min-width: 120px
    padding: 2px 4px
    background: rgba(0, 0, 0, 0.2)
    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.1)
    border-radius: 4px

.chess
  display: inline-block
  width: 16px
  height: 16px
  border-radius: 100%
  box-shadow: 0 0 0px 1px rgba(0, 0, 0, 0.1)
</style>
<style>
@keyframes user-avatar-frame-red {
  from {
    box-shadow: 0px 0px 6px 6px rgba(255, 0, 0, 0.5)
  }
}

@keyframes user-avatar-frame-black {
  from {
    box-shadow: 0px 0px 6px 6px rgba(0, 0, 0, 0.5)
  }
}
@keyframes user-avatar-frame-active {
  from {
    box-shadow: 0px 0px 6px 6px rgba(205, 220, 57, 0.5)
  }
}
</style>
