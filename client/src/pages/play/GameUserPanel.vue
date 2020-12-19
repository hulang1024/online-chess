<template>
  <q-card
    flat
    :class="[
      'game-user-panel',
      `q-py-${$q.screen.name}`
    ]"
  >
    <div class="row items-start">
      <circle-timer
        ref="circleStepTimer"
        size="64px"
        class="user-avatar-frame"
        :color="color"
      >
        <user-avatar
          :user="user"
          :online="online"
          :class="[{afk: user && (status == UserStatus.AFK)}]"
          size="60px"
        />
        <div
          v-show="user && (status == UserStatus.AFK)"
          class="absolute-bottom-right user-status"
        >
          <span>({{ online ? '离开' : '离线' }})</span>
        </div>
      </circle-timer>
      <div
        v-show="user"
        class="q-ml-xs"
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
    </div>
  </q-card>
</template>

<script lang="ts">
import {
  computed, defineComponent, getCurrentInstance, PropType,
} from "@vue/composition-api";
import UserAvatar from "src/user/components/UserAvatar.vue";
import User from "src/user/User";
import UserStatus from "src/user/UserStatus";
import ChessHost from "src/rule/chess_host";
import Timer from "./timer/Timer.vue";
import CircleTimer from "./timer/CircleTimer.vue";

export default defineComponent({
  components: { UserAvatar, Timer, CircleTimer },
  props: {
    user: Object as PropType<User>,
    online: Boolean,
    status: Number as PropType<UserStatus>,
    chessHost: Number as PropType<ChessHost | undefined>,
    active: Boolean,
  },
  setup(props) {
    const ctx = getCurrentInstance() as Vue;

    const color = computed(() => ((props.user && props.active)
      ? (props.chessHost == ChessHost.RED ? 'red' : ctx.$q.dark.isActive ? 'grey-2' : 'black')
      : 'transparent'));

    return {
      UserStatus,
      color,
    };
  },
});
</script>

<style lang="sass" scoped>
.game-user-panel
  width: 192px
  background: transparent

.nickname
  width: 124px
  font-size: 1.1em
  font-weight: 500

.chess-host
  &::before
    content: '('
  &::after
    content: ')'

.user-avatar-frame
  position: relative

  .user-avatar.afk
    filter: grayscale(80%) !important

  .user-status
    font-size: 10px

.time-panel
  .item
    padding-right: 16px
    .label
      padding-right: 4px
      font-size: 0.9em
      &::after
        content: ':'
    .time
      font-size: 0.9em
      font-weight: 500
</style>
