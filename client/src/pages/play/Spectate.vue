<template>
  <q-page :class="[!$q.screen.xs && 'row items-center q-px-sm q-py-sm']">
    <template v-if="$q.screen.xs">
      <div>
        <game-user-panel
          :user="otherUser"
          :online="otherOnline"
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
        <player-container ref="playerContainer">
          <text-overlay
            ref="textOverlay"
            class="absolute-center"
          />
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
                @click="onToggleViewClick"
              >
                <q-item-section>切换</q-item-section>
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
          :user="viewUser"
          :online="viewOnline"
          :chess-host="viewChessHost"
          :active="activeChessHost == viewChessHost"
          class="fixed-bottom-right"
        >
          <template #game-timer>
            <timer ref="viewGameTimer" />
          </template>
          <template #step-timer>
            <timer ref="viewStepTimer" />
          </template>
        </game-user-panel>
      </div>
    </template>
    <template v-else>
      <player-container ref="playerContainer">
        <text-overlay
          ref="textOverlay"
          class="absolute-center"
        />
      </player-container>
      <q-card
        flat
        class="controls q-px-sm q-py-sm"
      >
        <game-user-panel
          :user="otherUser"
          :online="otherOnline"
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
          :user="viewUser"
          :online="viewOnline"
          :chess-host="viewChessHost"
          :active="activeChessHost == viewChessHost"
        >
          <template #game-timer>
            <timer ref="viewGameTimer" />
          </template>
          <template #step-timer>
            <timer ref="viewStepTimer" />
          </template>
        </game-user-panel>
        <q-separator />
        <div class="row q-gutter-x-sm q-mt-sm">
          <q-btn
            label="离开"
            color="negative"
            class="q-mt-sm"
            @click="onQuitClick"
          />
          <q-btn
            label="切换"
            color="warning"
            class="q-mt-sm"
            @click="onToggleViewClick"
          />
        </div>
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
import User from 'src/online/user/User';
import { binableBindToRef, createBoundRef } from 'src/utils/vue/vue_ref_utils';
import { api } from 'src/boot/main';
import Room from 'src/online/room/Room';
import DrawableChessboard from './DrawableChessboard';
import PlayerContainer from './PlayerContainer.vue';
import GameUserPanel from './GameUserPanel.vue';
import ResultDialog from './ResultDialog.vue';
import TextOverlay from './TextOverlay.vue';
import Timer from './Timer.vue';
import Spectate from './Spectate';
import SpectateResponse from 'src/online/spectator/APISpectateResponse';
import Player from './Player';

export default defineComponent({
  components: {
    PlayerContainer,
    GameUserPanel,
    ResultDialog,
    TextOverlay,
    Timer,
  },
  setup() {
    const ctx = getCurrentInstance() as Vue;
    const { $route } = ctx;
    const { spectateResponse } = $route.params;

    const spectate = new Spectate(ctx, spectateResponse as unknown as SpectateResponse);
    const gameState: Ref<GameState> = createBoundRef(spectate.gameState);
    const isPlaying = computed(() => gameState.value == GameState.PLAYING);
    const activeChessHost: Ref<ChessHost | null> = createBoundRef(spectate.activeChessHost);
    const viewChessHost: Ref<ChessHost> = createBoundRef(spectate.viewChessHost);

    const otherChessHost: Ref<ChessHost | null> = ref(null);
    const viewUser: Ref<User | null> = ref(null);
    const viewOnline: Ref<boolean> = ref(false);
    const viewReadied: Ref<boolean> = ref(false);
    const otherUser: Ref<User | null> = ref(null);
    const otherOnline: Ref<boolean> = ref(false);
    const otherReadied: Ref<boolean> = ref(false);

    spectate.viewChessHost.addAndRunOnce((viewChessHost: ChessHost) => {
      otherChessHost.value = ChessHost.reverse(viewChessHost);
      [
        spectate.blackUser, spectate.blackOnline, spectate.blackReadied,
        spectate.redUser, spectate.redOnline, spectate.redReadied
      ].forEach((bindable) => {
        bindable.changed.removeAll(); // todo: 这里假设只有这里增加了绑定
      });
      if (viewChessHost == ChessHost.BLACK) {
        binableBindToRef(spectate.blackUser, viewUser);
        binableBindToRef(spectate.blackOnline, viewOnline);
        binableBindToRef(spectate.blackReadied, viewReadied);
        binableBindToRef(spectate.redUser, otherUser);
        binableBindToRef(spectate.redOnline, otherOnline);
        binableBindToRef(spectate.redReadied, otherReadied);
      } else {
        binableBindToRef(spectate.blackUser, otherUser);
        binableBindToRef(spectate.blackOnline, otherOnline);
        binableBindToRef(spectate.blackReadied, otherReadied);
        binableBindToRef(spectate.redUser, viewUser);
        binableBindToRef(spectate.redOnline, viewOnline);
        binableBindToRef(spectate.redReadied, viewReadied);
      }
    });

    let onReisze: () => void;
    onMounted(() => {
      const parent = ctx.$el as HTMLElement;
      const chessboard = new DrawableChessboard(parent?.offsetWidth || 0, ctx.$q.screen);
      // eslint-disable-next-line
      const container = (ctx.$refs.playerContainer as Vue).$el as Element;
      container.insertBefore(chessboard.el, container.firstChild);
      spectate.player = new Player();
      spectate.player.chessboard = chessboard;
      spectate.player.screen = ctx.$q.screen;
      spectate.playerLoaded.dispatch();

      window.addEventListener('resize', onReisze = () => {
        spectate.player.resize(parent?.offsetWidth || 0);
      });
    });
    onBeforeUnmount(() => {
      window.removeEventListener('resize', onReisze);
    });

    return {
      gameState,
      isPlaying,
      activeChessHost,

      viewUser,
      viewOnline,
      viewReadied,
      viewChessHost,

      otherUser,
      otherOnline,
      otherReadied,
      otherChessHost,

      onQuitClick: spectate.onQuitClick.bind(spectate),
      onToggleViewClick: spectate.onToggleViewClick.bind(spectate),
    };
  },
});
</script>

<style lang="sass" scoped>
.q-page
  flex-wrap: nowrap
</style>
