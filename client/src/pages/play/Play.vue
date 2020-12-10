<template>
  <q-page :class="[!$q.screen.xs && 'row items-center q-px-sm q-py-sm']">
    <template v-if="$q.screen.xs">
      <div>
        <game-user-panel
          :user="otherUser"
          :online="otherOnline"
          :chessHost="otherChessHost"
          :active="activeChessHost == otherChessHost"
          class="q-my-sm q-ml-sm"
        >
          <template #game-timer>
            <timer ref="otherGameTimer" />
          </template>
          <template #step-timer>
            <timer ref="otherStepTimer" />
          </template>
        </game-user-panel>
        <player ref="player">
          <ready-start-overlay
            :readied="readied"
            :otherReadied="otherReadied"
            :is-room-owner="isRoomOwner"
            :gameState="gameState"
            @ready-start="onReadyStartClick"
            class="absolute-center z-top"
          />
          <confirm-dialog ref="confirmDialog" />
          <text-overlay ref="textOverlay" class="absolute-center" style="z-index:1" />
          <result-dialog ref="resultDialog" />
        </player>
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
                clickable v-close-popup
                :disable="!(isPlaying && canWithdraw)"
                @click="onWithdrawClick"
              >
                <q-item-section>悔棋</q-item-section>
              </q-item>
              <q-separator />
              <q-item
                clickable v-close-popup
                :disable="!isPlaying"
                @click="onChessDrawClick"
              >
                <q-item-section>求和</q-item-section>
              </q-item>
              <q-separator />
              <q-item
                clickable v-close-popup 
                :disable="!isPlaying" @click="onWhiteFlagClick"
              >
                <q-item-section>认输</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="onQuitClick">
                <q-item-section>离开</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <game-user-panel
          :user="user"
          :online="online"
          :chessHost="chessHost"
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
      <player ref="player">
        <ready-start-overlay
          :readied="readied"
          :otherReadied="otherReadied"
          :is-room-owner="isRoomOwner"
          :gameState="gameState"
          @ready-start="onReadyStartClick"
          class="absolute-center z-top"
        />
        <confirm-dialog ref="confirmDialog" />
        <text-overlay ref="textOverlay" class="absolute-center" style="z-index:1" />
        <result-dialog ref="resultDialog" />
      </player>
      <q-card flat class="controls q-px-sm q-py-sm">
        <game-user-panel
          :user="otherUser"
          :online="otherOnline"
          :chessHost="otherChessHost"
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
          :chessHost="chessHost"
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
import { computed, defineComponent, getCurrentInstance, onBeforeUnmount, onMounted, Ref, ref, watch } from '@vue/composition-api'
import Player from './Player.vue';
import GameUserPanel from './GameUserPanel.vue';
import ReadyStartOverlay from './ReadyStartOverlay.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import ResultDialog from './ResultDialog.vue';
import TextOverlay from './TextOverlay.vue';
import Timer from './Timer.vue';
import GameState from 'src/online/play/GameState';
import APIAccess from 'src/online/api/APIAccess';
import GamePlay from './Play';
import ChessHost from 'src/rule/chess_host';
import User from 'src/online/user/User';
import { createBoundRef } from 'src/utils/vue/vue_ref_utils';
import Game from 'src/rule/Game';

export default defineComponent({
  components: {
    Player,
    GameUserPanel,
    ReadyStartOverlay,
    ConfirmDialog,
    ResultDialog,
    TextOverlay,
    Timer
  },
  setup() {
    const ctx = getCurrentInstance();
    const { $refs, $route } = <any>ctx;
    const api: APIAccess = (<any>ctx).api;

    const { room, initialGameStates } = $route.params;

    const gamePlay = new GamePlay(ctx, room, initialGameStates);
    const gameState: Ref<GameState> = createBoundRef(gamePlay.gameState);
    const activeChessHost: Ref<ChessHost> = createBoundRef(gamePlay.activeChessHost);
    const canWithdraw: Ref<boolean> = createBoundRef(gamePlay.canWithdraw);
    const user: Ref<User> = ref<User>(api.localUser);
    const online: Ref<boolean> = createBoundRef(gamePlay.online);
    const readied: Ref<boolean> = createBoundRef(gamePlay.readied);
    const chessHost: Ref<ChessHost> = createBoundRef(gamePlay.chessHost);
    const isRoomOwner: Ref<boolean> = createBoundRef(gamePlay.isRoomOwner);
    const otherUser: Ref<User | null> = createBoundRef(gamePlay.otherUser);
    const otherOnline: Ref<boolean> = createBoundRef(gamePlay.otherOnline);
    const otherReadied: Ref<boolean> = createBoundRef(gamePlay.otherReadied);
    const otherChessHost: Ref<ChessHost> = createBoundRef(gamePlay.otherChessHost);
    const isPlaying = computed(() => gameState.value == GameState.PLAYING);

    return {
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
      otherReadied,
      otherChessHost,

      onReadyStartClick: gamePlay.onReadyStartClick.bind(gamePlay),
      onQuitClick: gamePlay.onQuitClick.bind(gamePlay),
      onWithdrawClick: gamePlay.onWithdrawClick.bind(gamePlay),
      onChessDrawClick: gamePlay.onChessDrawClick.bind(gamePlay),
      onWhiteFlagClick: gamePlay.onWhiteFlagClick.bind(gamePlay)
    };
  }
});
</script>

<style lang="sass" scoped>
.q-page
  flex-wrap: nowrap
</style>