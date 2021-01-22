<template>
  <q-page :class="[!isXSScreen && 'row items-center q-pl-sm']">
    <template v-if="isXSScreen">
      <div>
        <game-user-panel
          ref="otherGameUserPanel"
          v-bind="otherUser"
          class="q-pt-sm q-ml-sm"
        />
        <div class="row absolute-top-right q-mt-sm q-mr-sm">
          <spectators-count-display
            :count="spectatorCount"
            class="q-mr-sm"
          />
        </div>
        <playfield
          ref="playfield"
          class="absolute-center"
        >
          <ready-overlay
            :readied="viewUser.readied"
            :other-readied="otherUser.readied"
            :is-room-owner="viewUser.isRoomOwner"
            :game-state="gameState"
            @invite="onInviteClick"
            @ready-start="onReadyStartClick"
            @quit="onQuitClick"
            class="absolute-center z-top"
          />
          <text-overlay
            ref="textOverlay"
            class="absolute-center"
          />
          <result-dialog ref="resultDialog" />
        </playfield>
        <div
          class="fixed-bottom-left"
          style="padding-left: 12px; padding-bottom: 12px"
        >
          <q-btn
            color="orange"
            label="菜单"
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
          <q-btn
            label="聊天"
            color="primary"
            @click.stop="onChatClick"
            class="q-ml-md"
          />
        </div>
        <game-user-panel
          ref="viewGameUserPanel"
          v-bind="viewUser"
          reverse
          class="fixed-bottom-right q-mr-sm q-mb-sm"
        />
      </div>
    </template>
    <template v-else>
      <playfield ref="playfield">
        <ready-overlay
          :readied="viewUser.readied"
          :other-readied="otherUser.readied"
          :is-room-owner="viewUser.isRoomOwner"
          :game-state="gameState"
          @invite="onInviteClick"
          @ready-start="onReadyStartClick"
          @quit="onQuitClick"
          class="absolute-center"
        />
        <text-overlay
          ref="textOverlay"
          class="absolute-center"
        />
        <result-dialog ref="resultDialog" />
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
            v-bind="otherUser"
          />
          <q-separator class="q-my-sm" />
          <game-user-panel
            ref="viewGameUserPanel"
            v-bind="viewUser"
          />
        </q-card>
        <q-card
          flat
          class="q-mb-xs q-px-xs q-py-sm"
        >
          <div class="flex justify-center q-gutter-sm">
            <template v-if="true">
              <q-btn
                label="悔棋"
                color="warning"
                :disable="!(isPlaying && canWithdraw)"
                @click="onWithdrawClick"
              />
              <q-btn
                label="求和"
                color="warning"
                :disable="!isPlaying"
                @click="onChessDrawClick"
              />
              <q-btn
                label="认输"
                color="warning"
                :disable="!isPlaying"
                @click="onWhiteFlagClick"
              />
            </template>
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
  computed, defineComponent, getCurrentInstance, onBeforeUnmount, onMounted, reactive, Ref, ref, watch,
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
import Playfield from './Playfield';
import PlayfieldView from './Playfield.vue';
import GameUserPanel from './GameUserPanel.vue';
import SpectatorsCountDisplay from './SpectatorsCountDisplay.vue';
import ReadyOverlay from './ReadyOverlay.vue';
import ResultDialog from './ResultDialog.vue';
import TextOverlay from './TextOverlay.vue';
import Player from './Player';
import ChatPanel from './ChatPanel.vue';
import GameUser from './GameUser';

export default defineComponent({
  components: {
    Playfield: PlayfieldView,
    GameUserPanel,
    SpectatorsCountDisplay,
    ReadyOverlay,
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
    const context = getCurrentInstance() as Vue;

    const { room, initialGameStates } = context.$route.params;

    const player = new Player(context,
      room as unknown as Room,
      initialGameStates as unknown as ResponseGameStates);
    
    const gameState: Ref<GameState> = createBoundRef(player.gameState);

    const toReactive = (user: GameUser) => {
      return reactive({
        user: createBoundRef(user.bindable),
        online: createBoundRef(user.online),
        status: createBoundRef(user.status),
        readied: createBoundRef(user.readied),
        chessHost: createBoundRef(user.chessHostBindable),
        isRoomOwner: createBoundRef(user.isRoomOwner),
        active: false,
      });
    };
    const viewUser = toReactive(player.localUser);
    const otherUser = toReactive(player.otherUser);

    const isPlaying = computed(() => gameState.value == GameState.PLAYING);
    
    const activeChessHost: Ref<ChessHost | null> = createBoundRef(player.activeChessHost);

    watch(activeChessHost, () => {
      // activeChessHost.value可能为空
      viewUser.active = activeChessHost.value == viewUser.chessHost;
      otherUser.active = activeChessHost.value == otherUser.chessHost;
    });

    const canWithdraw: Ref<boolean> = createBoundRef(player.canWithdraw);

    const spectatorCount: Ref<number> = createBoundRef(player.spectatorCount);

    // 有些元素随窗口尺寸变化无法实现，因此在初始时就确定屏幕大小
    const isXSScreen = context.$q.screen.xs;

    let onReisze: () => void;
    onMounted(() => {
      const pageEl = context.$el as HTMLElement;
      const playfieldEl = (context.$refs.playfield as Vue).$el as HTMLDivElement;
      const recalcChessboardSize = () => {
        const width = pageEl?.offsetWidth || 0;
        const height = (pageEl?.parentElement?.offsetHeight || 0) - 40 - 16 || 0;
        return {
          // eslint-disable-next-line
          width: isXSScreen ? width : width - (context.$refs.controls as any).offsetWidth + 8,
          height,
        };
      };
      const chessboard = new DrawableChessboard(recalcChessboardSize(), context.$q.screen);
      // eslint-disable-next-line
      playfieldEl.insertBefore(chessboard.el, playfieldEl.firstChild);
      player.playfield = new Playfield(context);
      player.playfield.chessboard = chessboard;
      player.playfield.screen = context.$q.screen;
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
      canWithdraw,

      viewUser,
      otherUser,
      spectatorCount,

      onInviteClick: () => {
        // eslint-disable-next-line
        (context.$vnode.context?.$refs.toolbar as any).toggle('socialBrowser');
      },
      onChatClick: () => {
        // eslint-disable-next-line
        (context.$vnode.context?.$refs.toolbar as any).toggle('chat');
      },
      onReadyStartClick: player.onReadyStartClick.bind(player),
      onQuitClick: player.onQuitClick.bind(player),
      onWithdrawClick: player.onWithdrawClick.bind(player),
      onChessDrawClick: player.onChessDrawClick.bind(player),
      onWhiteFlagClick: player.onWhiteFlagClick.bind(player),
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
