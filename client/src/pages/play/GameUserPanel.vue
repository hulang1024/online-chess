<template>
  <q-card
    flat
    class="game-user-panel"
  >
    <div
      class="row items-center"
      :class="{reverse}"
    >
      <circle-timer
        ref="circleStepTimer"
        size="68px"
        class="user-avatar-frame"
        :blink="blinkState"
        :color="color"
      >
        <user-avatar
          :user="user"
          :online="online"
          class=""
          :class="[{afk: user && (status == UserStatus.AFK), 'shadow-1': !!user}]"
          size="62px"
          @click="onUserAvatarClick"
        >
          <ready-status-display
            v-if="$q.screen.xs"
            v-show="user && showReadyStatus"
            :is-ready="ready"
            class="info-overlay absolute-center"
          />
        </user-avatar>
        <div
          v-show="user && (status == UserStatus.AFK || !online)"
          class="absolute-bottom-right user-status"
        >
          <span>({{ online ? '离开' : '离线' }})</span>
        </div>
      </circle-timer>
      <div
        v-show="user"
        class="user-info"
        :class="`q-m${reverse ? 'r' : 'l'}-xs`"
        :style="{textAlign: reverse ? 'right' : 'left'}"
      >
        <div class="nickname ellipsis">
          {{ user && user.nickname }}
        </div>
        <div class="time-panel">
          <div class="item">
            <span class="label">步时</span>
            <timer ref="stepTimer" class="step-timer" />
          </div>
          <div class="item">
            <span class="label">局时</span>
            <timer ref="gameTimer" class="game-timer" />
          </div>
        </div>
      </div>
      <ready-status-display
        v-if="!$q.screen.xs"
        v-show="user && showReadyStatus"
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
import Timer from "./timer/Timer.vue";
import CircleTimer from "./timer/CircleTimer.vue";
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

    const color = computed(() => {
      const GAME_TYPE_COLOR_MAP = {
        [GameType.chinesechess]: {
          [ChessHost.FIRST]: 'red',
          [ChessHost.SECOND]: context.$q.dark.isActive ? 'grey-2' : 'black',
        },
        [GameType.gobang]: {
          [ChessHost.FIRST]: context.$q.dark.isActive ? 'grey-8' : 'black',
          [ChessHost.SECOND]: context.$q.dark.isActive ? 'white' : 'grey-4',
        },
      };
      return ((props.user && props.active)
        ? GAME_TYPE_COLOR_MAP[props.gameType as GameType][props.chess as ChessHost]
        : 'transparent');
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
      color,

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
  width: 124px
  font-size: 1.2em
  font-weight: 400

.chess-host
  &::before
    content: '('
  &::after
    content: ')'

.user-avatar-frame
  position: relative

  .user-avatar.afk
    opacity: 0.6 !important

  .user-status
    font-size: 12px

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
  .item
    user-select: none
    .label
      padding-right: 2px
      font-size: 1em
      &::after
        content: ':'

    .time
      font-size: 1em
      font-weight: 500
</style>
