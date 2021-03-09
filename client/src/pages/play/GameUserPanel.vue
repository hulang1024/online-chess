<template>
  <q-card
    flat
    class="game-user-panel"
  >
    <div class="row items-center justify-between">
      <div :class="['row', 'items-center', 'no-wrap', {reverse}]">
        <circle-timer
          ref="circleStepTimer"
          size="70px"
          class="user-avatar-frame"
          :class="{[config.activeClass]: active}"
          :blink="blinkState"
          :color="config.timerColor"
        >
          <user-avatar
            :user="user"
            :online="online"
            :class="[{
              afk: user && (status == UserStatus.AFK),
              'shadow-1': !!user && !active
            }]"
            size="60px"
            @click="onUserAvatarClick"
          >
            <ready-status-display
              v-if="$q.screen.xs"
              :is-ready="ready"
              class="info-overlay absolute-center"
              :class="(user && showReadyStatus) && 'show'"
            />
          </user-avatar>
          <div
            v-show="user && (status == UserStatus.AFK || !online)"
            :class="['user-status', `absolute-bottom-${reverse ? 'right' : 'left'}`]"
          >
            <span>({{ online ? '离开' : '离线' }})</span>
          </div>
        </circle-timer>
        <div
          v-show="user"
          class="user-info"
          :class="`q-m${reverse ? 'r' : 'l'}-sm`"
          :style="{textAlign: reverse ? 'right' : 'left'}"
        >
          <div
            class="row items-center"
            :class="[reverse && 'reverse']"
          >
            <div :class="['nickname', 'ellipsis', $q.screen.xs && 'xs-screen']">
              {{ user && user.nickname }}
            </div>
          </div>
          <div
            class="row items-center"
            :class="[reverse && 'reverse']"
          >
            <div
              v-if="config.chessColor"
              class="chess"
              :class="`q-m${reverse ? 'l' : 'r'}-${$q.screen.xs ? 'xs' : 'sm'}`"
              :style="{backgroundColor: config.chessColor}"
            />
            <span>{{ config.chessName }}棋</span>
          </div>
          <div
            class="row time-panel"
            :class="[($q.screen.xs && reverse) && 'reverse']"
          >
            <div :class="`item q-m${reverse ? 'l' : 'r'}-${$q.screen.xs ? 'xs' : 'sm'}`">
              <span class="label">步时</span>
              <timer ref="stepTimer" />
            </div>
            <div class="item">
              <span class="label">局时</span>
              <timer ref="gameTimer" />
            </div>
          </div>
        </div>
      </div>
      <ready-status-display
        v-if="!$q.screen.xs"
        :class="[(user && showReadyStatus) && 'show', !$q.screen.xs && 'has-border']"
        :is-ready="ready"
      />
    </div>
  </q-card>
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
import CircleTimer from "../../rulesets/ui/timer/CircleTimer.vue";
import ReadyStatusDisplay from "./ReadyStatusDisplay.vue";

export default defineComponent({
  components: {
    UserAvatar,
    Timer,
    CircleTimer,
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
.game-user-panel
  background: transparent

.nickname
  width: 118px
  font-size: 1.1em
  font-weight: 400
  &.xs-screen
    width: unset
    max-width: 118px

.chess-host
  &::before
    content: '('
  &::after
    content: ')'

.user-avatar-frame
  position: relative
  border-radius: 100%
  transition: all 0.2s ease-out

  .user-avatar
    &.afk
      opacity: 0.6 !important

  &.red
    box-shadow: 0px 0px 0px 6px rgba(255, 0, 0, 0.3)

  &.black
    box-shadow: 0px 0px 0px 6px rgba(0, 0, 0, 0.2)

  &.chess-active
    box-shadow: 0px 0px 0px 6px rgba(205, 220, 57, 0.3)

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
    border-radius: 100%
    transition: all 0.2s ease

.time-panel
  display: flex
  flex-wrap: nowrap

  .item
    display: flex
    flex-wrap: nowrap
    user-select: none

    .label
      font-size: 1em
      word-break: keep-all
      &::after
        content: ':'

    .time
      font-size: 1em
      font-weight: 500

.chess
  display: inline-block
  width: 16px
  height: 16px
  border-radius: 100%
  box-shadow: 0 0 0px 1px rgba(0, 0, 0, 0.1)

.ready-status
  width: 62px
  visibility: hidden

  &.has-border
    text-align: center
    border-radius: 4px
    border: 1px solid

  &.show
    visibility: visible
</style>
