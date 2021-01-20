<template>
  <q-page :class="[!isXSScreen && 'row items-center q-pl-sm']">
    <template v-if="isXSScreen">
      <div>
        <game-user-panel
          ref="otherGameUserPanel"
          :user="otherUser"
          :online="otherOnline"
          :status="otherUserStatus"
          :chess-host="otherChessHost"
          :active="activeChessHost == otherChessHost"
          class="q-pt-sm q-ml-sm"
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
        <playfield
          ref="playfield"
          class="absolute-center"
        >
          <text-overlay
            ref="textOverlay"
            class="absolute-center"
          />
        </playfield>
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
          class="fixed-bottom-right q-mr-sm q-mb-sm"
        />
      </div>
    </template>
    <template v-else>
      <playfield ref="playfield">
        <text-overlay
          ref="textOverlay"
          class="absolute-center"
        />
      </playfield>
      <div ref="controls" class="controls">
        <spectators-count-display
          show-always
          :count="spectatorCount"
          class="q-mb-xs"
          style="text-align: right"
        />
        <q-card
          flat
          class="q-mb-xs q-px-sm q-py-sm"
        >
          <game-user-panel
            ref="otherGameUserPanel"
            :user="otherUser"
            :online="otherOnline"
            :status="otherUserStatus"
            :chess-host="otherChessHost"
            :active="activeChessHost == otherChessHost"
          />
          <q-separator class="q-my-sm" />
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
          class="q-mb-xs q-px-xs q-py-sm"
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

        <chat-panel ref="chatPanel" />
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
import SpectatorPlayer from './SpectatorPlayer';
import Playfield from './Playfield';
import PlayfieldView from './Playfield.vue';
import GameUserPanel from './GameUserPanel.vue';
import SpectatorsCountDisplay from './SpectatorsCountDisplay.vue';
import ResultDialog from './ResultDialog.vue';
import TextOverlay from './TextOverlay.vue';
import ChatPanel from './ChatPanel.vue';

export default defineComponent({
  components: {
    Playfield: PlayfieldView,
    GameUserPanel,
    SpectatorsCountDisplay,
    ResultDialog,
    TextOverlay,
    ChatPanel,
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

    const player = new SpectatorPlayer(ctx, spectateResponse as unknown as SpectateResponse);
    const gameState: Ref<GameState> = createBoundRef(player.gameState);
    const isPlaying = computed(() => gameState.value == GameState.PLAYING);
    const activeChessHost: Ref<ChessHost | null> = createBoundRef(player.activeChessHost);
    const viewChessHost: Ref<ChessHost> = createBoundRef(player.viewChessHost);
    const spectatorCount: Ref<number> = createBoundRef(player.spectatorCount);

    const otherChessHost: Ref<ChessHost | null> = ref(null);
    const viewUser: Ref<User | null> = ref(null);
    const viewUserStatus: Ref<UserStatus | null> = ref(null);
    const viewOnline: Ref<boolean> = ref(false);
    const viewReadied: Ref<boolean> = ref(false);
    const otherUser: Ref<User | null> = ref(null);
    const otherUserStatus: Ref<UserStatus | null> = ref(null);
    const otherOnline: Ref<boolean> = ref(false);
    const otherReadied: Ref<boolean> = ref(false);

    player.viewChessHost.addAndRunOnce((chessHost: ChessHost) => {
      otherChessHost.value = ChessHost.reverse(chessHost);
      [
        player.blackUser, player.blackUserStatus,
        player.blackOnline, player.blackReadied,
        player.redUser, player.redUserStatus,
        player.redOnline, player.redReadied,
      ].forEach((bindable) => {
        bindable.changed.removeAll(); // todo: 这里假设只有这里增加了绑定
      });
      if (chessHost == ChessHost.BLACK) {
        binableBindToRef(player.blackUser, viewUser);
        binableBindToRef(player.blackUserStatus, viewUserStatus);
        binableBindToRef(player.blackOnline, viewOnline);
        binableBindToRef(player.blackReadied, viewReadied);
        binableBindToRef(player.redUser, otherUser);
        binableBindToRef(player.redUserStatus, otherUserStatus);
        binableBindToRef(player.redOnline, otherOnline);
        binableBindToRef(player.redReadied, otherReadied);
      } else {
        binableBindToRef(player.blackUser, otherUser);
        binableBindToRef(player.blackUserStatus, otherUserStatus);
        binableBindToRef(player.blackOnline, otherOnline);
        binableBindToRef(player.blackReadied, otherReadied);
        binableBindToRef(player.redUser, viewUser);
        binableBindToRef(player.redUserStatus, viewUserStatus);
        binableBindToRef(player.redOnline, viewOnline);
        binableBindToRef(player.redReadied, viewReadied);
      }
    });

    // 有些元素随窗口尺寸变化无法实现，因此在初始时就确定屏幕大小
    const isXSScreen = ctx.$q.screen.xs;

    let onReisze: () => void;
    onMounted(() => {
      const pageEl = ctx.$el as HTMLElement;
      const playfieldEl = (ctx.$refs.playfield as Vue).$el as HTMLDivElement;
      const recalcChessboardSize = () => {
        const width = pageEl?.offsetWidth || 0;
        const height = (pageEl?.parentElement?.offsetHeight || 0) - 40 - 16 || 0;
        return {
          // eslint-disable-next-line
          width: isXSScreen ? width : width - (ctx.$refs.controls as any).offsetWidth + 8,
          height,
        };
      };
      const chessboard = new DrawableChessboard(recalcChessboardSize(), ctx.$q.screen);
      playfieldEl.insertBefore(chessboard.el, playfieldEl.firstChild);
      player.playfield = new Playfield(ctx);
      player.playfield.chessboard = chessboard;
      player.playfield.screen = ctx.$q.screen;
      player.playfieldLoaded.dispatch();

      window.addEventListener('resize', onReisze = () => {
        if (isXSScreen) {
          return;
        }
        player.playfield.resize(recalcChessboardSize());
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

      onQuitClick: player.onQuitClick.bind(spectator),
      onInviteClick: player.onInviteClick.bind(spectator),
      onToggleViewClick: player.onToggleViewClick.bind(spectator),
    };
  },
});
</script>

<style lang="sass" scoped>
.q-page
  flex-wrap: nowrap
.controls
  padding: 8px
  width: 310px
  display: flex
  flex-direction: column
  min-height: inherit

  .chat-panel
    flex-grow: 1
</style>
