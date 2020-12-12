<template>
  <q-card
    flat
    :class="[
      'game-user-panel',
      `q-py-${$q.screen.name}`
    ]"
  >
    <div class="row items-start">
      <div
        class="user-avatar-frame"
        :style="{borderColor: (user == null || active) ? chessHostColor : 'transparent'}"
      >
        <user-avatar
          :user="user"
          :class="{offline: !online}"
          size="60px"
        />
      </div>
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
            <slot
              name="step-timer"
              class="time"
            />
          </div>
          <div class="item">
            <span class="label">局时</span>
            <slot
              name="game-timer"
              class="time"
            />
          </div>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "@vue/composition-api";
import UserAvatar from "src/components/UserAvatar.vue";
import User from "src/online/user/User";
import ChessHost from "src/rule/chess_host";
import Timer from "./Timer.vue";

export default defineComponent({
  components: { UserAvatar, Timer },
  props: {
    user: Object as PropType<User>,
    online: Boolean,
    chessHost: Number as PropType<ChessHost | undefined>,
    active: Boolean,
  },
  setup(props) {
    return {
      chessHostColor: computed(() => (props.chessHost == ChessHost.RED ? 'red' : 'black')),
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
  border: 2px solid transparent
  border-radius: 6px
  transition: all 0.1s ease-out

  .user-avatar.offline
    filter: grayscale(100%)

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
