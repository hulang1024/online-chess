<template>
  <q-page :class="[!isXSScreen && 'row items-center q-px-sm q-py-sm']">
    <template v-if="isXSScreen">
      <div>
        <game-user-panel
          :user="otherUser"
          :online="otherOnline"
          :status="otherUserStatus"
          :chess-host="otherChessHost"
          :active="activeChessHost == otherChessHost"
          class="q-py-sm q-ml-xs"
        >
          <template #game-timer>
            <timer ref="otherGameTimer" />
          </template>
          <template #step-timer>
            <timer ref="otherStepTimer" />
          </template>
        </game-user-panel>
        <player-container
          ref="playerContainer"
          class="absolute-center"
        >
          <ready-start-overlay
            :readied="readied"
            :other-readied="otherReadied"
            :is-room-owner="isRoomOwner"
            :game-state="gameState"
            @ready-start="onReadyStartClick"
            class="absolute-center z-top"
          />
          <confirm-dialog ref="confirmDialog" />
          <text-overlay
            ref="textOverlay"
            class="absolute-center"
          />
          <result-dialog ref="resultDialog" />
        </player-container>
        <q-btn
          color="orange"
          label="菜单"
          class="fixed-bottom-left q-mb-sm q-ml-sm"
        >
          <q-menu
            transition-show="jump-up"
            transition-hide="jump-down"
            :offset="[0, 8]"
            auto-close
          >
            <q-list style="min-width: 100px">
              <q-item
                clickable
                v-close-popup
                :disable="!(isPlaying && canWithdraw)"
                @click="onWithdrawClick"
              >
                <q-item-section>悔棋</q-item-section>
              </q-item>
              <q-separator />
              <q-item
                clickable
                v-close-popup
                :disable="!isPlaying"
                @click="onChessDrawClick"
              >
                <q-item-section>求和</q-item-section>
              </q-item>
              <q-separator />
              <q-item
                clickable
                v-close-popup
                :disable="!isPlaying"
                @click="onWhiteFlagClick"
              >
                <q-item-section>认输</q-item-section>
              </q-item>
              <q-separator />
              <q-item
                clickable
                v-close-popup
                @click="onQuitClick"
              >
                <q-item-section>离开</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <game-user-panel
          :user="user"
          :online="online"
          :chess-host="chessHost"
          :active="activeChessHost == chessHost"
          class="fixed-bottom-right"
        >
          <template #game-timer>
            <timer ref="gameTimer" />
          </template>
          <template #step-timer>
            <timer ref="stepTimer" />
          </template>
        </game-user-panel>
      </div>
    </template>
    <template v-else>
      <player-container ref="playerContainer">
        <ready-start-overlay
          :readied="readied"
          :other-readied="otherReadied"
          :is-room-owner="isRoomOwner"
          :game-state="gameState"
          @ready-start="onReadyStartClick"
          class="absolute-center"
        />
        <confirm-dialog ref="confirmDialog" />
        <text-overlay
          ref="textOverlay"
          class="absolute-center"
        />
        <result-dialog ref="resultDialog" />
      </player-container>
      <q-card
        flat
        class="controls q-px-sm q-py-sm"
      >
        <game-user-panel
          :user="otherUser"
          :online="otherOnline"
          :status="otherUserStatus"
          :chess-host="otherChessHost"
          :active="activeChessHost == otherChessHost"
        >
          <template #game-timer>
            <timer ref="otherGameTimer" />
          </template>
          <template #step-timer>
            <timer ref="otherStepTimer" />
          </template>
        </game-user-panel>
        <q-separator />
        <game-user-panel
          :user="user"
          :online="online"
          :chess-host="chessHost"
          :active="activeChessHost == chessHost"
        >
          <template #game-timer>
            <timer ref="gameTimer" />
          </template>
          <template #step-timer>
            <timer ref="stepTimer" />
          </template>
        </game-user-panel>
        <q-separator />
        <div class="row q-gutter-x-sm q-mt-sm">
          <q-btn
            label="悔棋"
            color="warning"
            class="q-mt-sm"
            :disable="!(isPlaying && canWithdraw)"
            @click="onWithdrawClick"
          />
          <q-btn
            label="求和"
            color="warning"
            class="q-mt-sm"
            :disable="!isPlaying"
            @click="onChessDrawClick"
          />
          <q-btn
            label="认输"
            color="warning"
            class="q-mt-sm"
            :disable="!isPlaying"
            @click="onWhiteFlagClick"
          />
        </div>
        <q-btn
          label="离开"
          color="negative"
          class="q-mt-sm"
          @click="onQuitClick"
        />
      </q-card>
    </template>
  </q-page>
</template>

<script lang="ts">
import {
  computed, defineComponent, getCurrentInstance, onBeforeUnmount, onMounted, Ref, ref,
} from '@vue/composition-api';
import GameState from 'src/online/play/GameState';
import ChessHost from 'src/rule/chess_host';
import User from 'src/user/User';
import { createBoundRef } from 'src/utils/vue/vue_ref_utils';
import { api } from 'src/boot/main';
import Room from 'src/online/room/Room';
import ResponseGameStates from 'src/online/play/game_states_response';
import UserStatus from 'src/user/UserStatus';
import DrawableChessboard from './DrawableChessboard';
import PlayerContainer from './PlayerContainer.vue';
import GameUserPanel from './GameUserPanel.vue';
import ReadyStartOverlay from './ReadyStartOverlay.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import ResultDialog from './ResultDialog.vue';
import TextOverlay from './TextOverlay.vue';
import Timer from './Timer.vue';
import GamePlay from './Play';
import Player from './Player';

export default defineComponent({
  components: {
    PlayerContainer,
    GameUserPanel,
    ReadyStartOverlay,
    ConfirmDialog,
    ResultDialog,
    TextOverlay,
    Timer,
  },
  setup() {
    const ctx = getCurrentInstance() as Vue;
    const { $route } = ctx;

    const { room, initialGameStates } = $route.params;

    const gamePlay = new GamePlay(ctx,
      room as unknown as Room,
      initialGameStates as unknown as ResponseGameStates);
    const gameState: Ref<GameState> = createBoundRef(gamePlay.gameState);
    const isPlaying = computed(() => gameState.value == GameState.PLAYING);
    const activeChessHost: Ref<ChessHost> = createBoundRef(gamePlay.activeChessHost);
    const canWithdraw: Ref<boolean> = createBoundRef(gamePlay.canWithdraw);
    const user: Ref<User> = ref<User>(api.localUser);
    const online: Ref<boolean> = createBoundRef(gamePlay.online);
    const readied: Ref<boolean> = createBoundRef(gamePlay.readied);
    const chessHost: Ref<ChessHost> = createBoundRef(gamePlay.chessHost);
    const isRoomOwner: Ref<boolean> = createBoundRef(gamePlay.isRoomOwner);
    const otherUser: Ref<User | null> = createBoundRef(gamePlay.otherUser);
    const otherUserStatus: Ref<UserStatus> = createBoundRef(gamePlay.otherUserStatus);
    const otherOnline: Ref<boolean> = createBoundRef(gamePlay.otherOnline);
    const otherReadied: Ref<boolean> = createBoundRef(gamePlay.otherReadied);
    const otherChessHost: Ref<ChessHost> = createBoundRef(gamePlay.otherChessHost);

    // 有些元素随窗口尺寸变化无法实现，因此在初始时就确定屏幕大小
    const isXSScreen = ctx.$q.screen.xs;

    let onReisze: () => void;
    onMounted(() => {
      const pageEl = ctx.$el as HTMLElement;
      const container = (ctx.$refs.playerContainer as Vue).$el as HTMLDivElement;
      const recalcChessboardSize = () => {
        const CONTROLS_WIDTH = 212 + 8;
        const width = (pageEl?.offsetWidth || 0);
        return isXSScreen ? width : width - CONTROLS_WIDTH;
      };
      const chessboard = new DrawableChessboard(recalcChessboardSize(), ctx.$q.screen);
      // eslint-disable-next-line
      container.insertBefore(chessboard.el, container.firstChild);
      gamePlay.player = new Player();
      gamePlay.player.chessboard = chessboard;
      gamePlay.player.screen = ctx.$q.screen;
      gamePlay.playerLoaded.dispatch();

      window.addEventListener('resize', onReisze = () => {
        gamePlay.player.resize(recalcChessboardSize());
      });
    });
    onBeforeUnmount(() => {
      window.removeEventListener('resize', onReisze);
    });

    return {
      isXSScreen,

      gameState,
      isPlaying,
      activeChessHost,
      canWithdraw,

      user,
      online,
      readied,
      chessHost,
      isRoomOwner,

      otherUser,
      otherOnline,
      otherUserStatus,
      otherReadied,
      otherChessHost,

      onReadyStartClick: gamePlay.onReadyStartClick.bind(gamePlay),
      onQuitClick: gamePlay.onQuitClick.bind(gamePlay),
      onWithdrawClick: gamePlay.onWithdrawClick.bind(gamePlay),
      onChessDrawClick: gamePlay.onChessDrawClick.bind(gamePlay),
      onWhiteFlagClick: gamePlay.onWhiteFlagClick.bind(gamePlay),
    };
  },
});
</script>

<style lang="sass" scoped>
.q-page
  flex-wrap: nowrap
</style>
