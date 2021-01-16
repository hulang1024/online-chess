<template>
  <q-page :class="[!isXSScreen && 'row items-center q-px-sm q-py-sm']">
    <template v-if="isXSScreen">
      <div>
        <game-user-panel
          ref="otherGameUserPanel"
          :user="otherUser"
          :online="otherOnline"
          :status="otherUserStatus"
          :chess-host="otherChessHost"
          :active="activeChessHost == otherChessHost"
          class="q-py-sm q-ml-xs"
        />
        <div class="row absolute-top-right q-mt-sm q-mr-sm">
          <spectators-count-display
            :count="spectatorCount"
            class="q-mr-sm"
          />
          <q-btn
            outline
            label="邀请"
            color="orange"
            @click.stop="onInviteClick"
          />
        </div>
        <player-container
          ref="playerContainer"
          class="absolute-center"
        >
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
          ref="viewGameUserPanel"
          :user="viewUser"
          :online="viewOnline"
          :status="viewUserStatus"
          :chess-host="viewChessHost"
          :active="activeChessHost == viewChessHost"
          reverse
          class="fixed-bottom-right q-mr-xs"
        />
      </div>
    </template>
    <template v-else>
      <player-container ref="playerContainer">
        <text-overlay
          ref="textOverlay"
          class="absolute-center"
        />
      </player-container>
      <div class="controls">
        <spectators-count-display
          :count="spectatorCount"
          class="q-mb-sm"
          style="text-align: right"
        />
        <q-card
          flat
          class="q-mb-sm q-px-sm q-py-sm"
        >
          <game-user-panel
            ref="otherGameUserPanel"
            :user="otherUser"
            :online="otherOnline"
            :status="otherUserStatus"
            :chess-host="otherChessHost"
            :active="activeChessHost == otherChessHost"
          />
          <q-separator />
          <game-user-panel
            ref="viewGameUserPanel"
            :user="viewUser"
            :online="viewOnline"
            :status="viewUserStatus"
            :chess-host="viewChessHost"
            :active="activeChessHost == viewChessHost"
          />
        </q-card>
        <q-card
          flat
          class="q-px-sm q-py-sm"
        >
          <div class="flex justify-center q-gutter-sm">
            <q-btn
              label="切换"
              color="warning"
              @click="onToggleViewClick"
            />
            <q-btn
              label="邀请"
              color="orange"
              @click.stop="onInviteClick"
            />
            <q-btn
              label="离开"
              color="negative"
              @click="onQuitClick"
            />
          </div>
        </q-card>
      </div>
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
import { binableBindToRef, createBoundRef } from 'src/utils/vue/vue_ref_utils';
import SpectateResponse from 'src/online/spectator/APISpectateResponse';
import UserStatus from 'src/user/UserStatus';
import DrawableChessboard from './DrawableChessboard';
import PlayerContainer from './PlayerContainer.vue';
import GameUserPanel from './GameUserPanel.vue';
import SpectatorsCountDisplay from './SpectatorsCountDisplay.vue';
import ResultDialog from './ResultDialog.vue';
import TextOverlay from './TextOverlay.vue';
import Spectate from './Spectate';
import Player from './Player';

export default defineComponent({
  components: {
    PlayerContainer,
    GameUserPanel,
    SpectatorsCountDisplay,
    ResultDialog,
    TextOverlay,
  },
  inject: ['reload'],
  watch: {
    $route() {
      // eslint-disable-next-line
      (this.reload as any)();
    },
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
    const spectatorCount: Ref<number> = createBoundRef(spectate.spectatorCount);

    const otherChessHost: Ref<ChessHost | null> = ref(null);
    const viewUser: Ref<User | null> = ref(null);
    const viewUserStatus: Ref<UserStatus | null> = ref(null);
    const viewOnline: Ref<boolean> = ref(false);
    const viewReadied: Ref<boolean> = ref(false);
    const otherUser: Ref<User | null> = ref(null);
    const otherUserStatus: Ref<UserStatus | null> = ref(null);
    const otherOnline: Ref<boolean> = ref(false);
    const otherReadied: Ref<boolean> = ref(false);

    spectate.viewChessHost.addAndRunOnce((chessHost: ChessHost) => {
      otherChessHost.value = ChessHost.reverse(chessHost);
      [
        spectate.blackUser, spectate.blackUserStatus, spectate.blackOnline, spectate.blackReadied,
        spectate.redUser, spectate.redUserStatus, spectate.redOnline, spectate.redReadied,
      ].forEach((bindable) => {
        bindable.changed.removeAll(); // todo: 这里假设只有这里增加了绑定
      });
      if (chessHost == ChessHost.BLACK) {
        binableBindToRef(spectate.blackUser, viewUser);
        binableBindToRef(spectate.blackUserStatus, viewUserStatus);
        binableBindToRef(spectate.blackOnline, viewOnline);
        binableBindToRef(spectate.blackReadied, viewReadied);
        binableBindToRef(spectate.redUser, otherUser);
        binableBindToRef(spectate.redUserStatus, otherUserStatus);
        binableBindToRef(spectate.redOnline, otherOnline);
        binableBindToRef(spectate.redReadied, otherReadied);
      } else {
        binableBindToRef(spectate.blackUser, otherUser);
        binableBindToRef(spectate.blackUserStatus, otherUserStatus);
        binableBindToRef(spectate.blackOnline, otherOnline);
        binableBindToRef(spectate.blackReadied, otherReadied);
        binableBindToRef(spectate.redUser, viewUser);
        binableBindToRef(spectate.redUserStatus, viewUserStatus);
        binableBindToRef(spectate.redOnline, viewOnline);
        binableBindToRef(spectate.redReadied, viewReadied);
      }
    });

    // 有些元素随窗口尺寸变化无法实现，因此在初始时就确定屏幕大小
    const isXSScreen = ctx.$q.screen.xs;

    let onReisze: () => void;
    onMounted(() => {
      const pageEl = ctx.$el as HTMLElement;
      const container = (ctx.$refs.playerContainer as Vue).$el as HTMLDivElement;
      const recalcChessboardSize = () => {
        const CONTROLS_WIDTH = 214 + 8;
        const width = (pageEl?.offsetWidth || 0);
        return isXSScreen ? width : width - CONTROLS_WIDTH;
      };
      const chessboard = new DrawableChessboard(recalcChessboardSize(), ctx.$q.screen);
      container.insertBefore(chessboard.el, container.firstChild);
      spectate.player = new Player(ctx);
      spectate.player.chessboard = chessboard;
      spectate.player.screen = ctx.$q.screen;
      spectate.playerLoaded.dispatch();

      window.addEventListener('resize', onReisze = () => {
        spectate.player.resize(recalcChessboardSize());
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

      viewUser,
      viewUserStatus,
      viewOnline,
      viewReadied,
      viewChessHost,

      otherUser,
      otherUserStatus,
      otherOnline,
      otherReadied,
      otherChessHost,

      spectatorCount,

      onQuitClick: spectate.onQuitClick.bind(spectate),
      onInviteClick: spectate.onInviteClick.bind(spectate),
      onToggleViewClick: spectate.onToggleViewClick.bind(spectate),
    };
  },
});
</script>

<style lang="sass" scoped>
.q-page
  flex-wrap: nowrap
.controls
  width: 212px
</style>
