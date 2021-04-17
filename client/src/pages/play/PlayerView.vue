<template>
  <q-page
    :class="[
      'play',
      $q.platform.is.mobile ? 'xs-screen' : 'row items-center',
      $q.dark.isActive && 'dark'
    ]"
  >
    <template v-if="$q.platform.is.mobile">
      <game-user-panel
        ref="otherGameUserPanel"
        v-bind="otherUser"
        :game-type="gameType"
        :class="reverse ? 'fixed-bottom-right' : 'absolute-top-left'"
      />
      <game-user-panel
        ref="viewGameUserPanel"
        v-bind="viewUser"
        :game-type="gameType"
        :class="reverse ? 'absolute-top-left' : 'fixed-bottom-right'"
      />
      <div class="row absolute-top-right q-mt-sm q-mr-sm">
        <q-card
          v-show="spectatorCount > 0"
          flat
          class="q-px-sm q-py-sm"
          :style="{background: $q.dark.isActive ? 'transparent' : 'rgba(255,255,255,0.3)'}"
        >
          <spectator-count-display :count="spectatorCount" />
        </q-card>
      </div>
      <playfield
        ref="playfield"
        class="absolute-center"
      >
        <text-overlay
          ref="textOverlay"
          class="absolute-center"
          style="z-index: 513;"
        />
        <text-overlay
          v-if="[1, 3].includes(gameState) && gameStatus.text"
          visible
          :text="gameStatus.text"
          class="absolute-center"
          style="z-index: 512;"
        />
        <div
          class="absolute-center full-width"
          style="position: absolute; top: calc(50% + 108px); z-index: 512;"
        >
          <slot name="main-overlay" />
        </div>
        <result-dialog
          ref="resultDialog"
          :show-again="!viewUser.isRoomOwner"
          class="absolute-center"
          style="z-index: 513;"
        />
      </playfield>
      <div class="fixed-bottom-left">
        <q-btn
          icon="navigation"
          color="white"
          text-color="primary"
          round
          push
          size="16px"
        >
          <q-menu
            transition-show="jump-up"
            transition-hide="jump-down"
            :offset="[0, 8]"
            auto-close
          >
            <q-list>
              <q-item
                clickable
                v-close-popup
                @click="onQuitClick"
              >
                <q-item-section>
                  <label><q-icon name="fas fa-chevron-left" />退出</label>
                </q-item-section>
              </q-item>
              <q-separator />
              <template v-if="enableGameRuleButtons">
                <template v-if="canWithdraw">
                  <q-item
                    clickable
                    v-close-popup
                    :disable="confirmRequestLoadings[3] || !(isPlaying && withdrawEnabled)"
                    @click="onWithdrawClick"
                  >
                    <q-item-section>
                      <q-item-label><q-icon name="fas fa-redo" /> 悔棋</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator />
                </template>
                <q-item
                  clickable
                  v-close-popup
                  :disable="confirmRequestLoadings[2] || !canChessDraw"
                  @click="onChessDrawClick"
                >
                  <q-item-section>
                    <q-item-label><q-icon name="far fa-handshake" />求和</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item
                  clickable
                  v-close-popup
                  :disable="!canWhiteFlag"
                  @click="onWhiteFlagClick"
                >
                  <q-item-section>
                    <q-item-label><q-icon name="far fa-frown" />认输</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item
                  v-close-popup
                  clickable
                  :disable="confirmRequestLoadings[isPlaying ? 4 : 5]
                    || ![2, 3].includes(gameState)"
                  @click="onPauseOrResumeGameClick"
                >
                  <q-item-section>
                    <q-item-label>
                      <q-icon name="far fa-clock" />
                      <span>{{ pauseOrResumeText }}</span>
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
              </template>
              <q-item
                clickable
                v-close-popup
                @click="onHelpClick"
              >
                <q-item-section>
                  <label><q-icon name="far fa-question-circle" />帮助</label>
                </q-item-section>
              </q-item>
              <q-separator />
              <slot name="xs-screen-main-buttons" />
              <q-item
                clickable
                v-close-popup
                @click="onSettingsClick"
              >
                <q-item-section>
                  <label><q-icon name="fas fa-cog" /> 设置</label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn
          icon="chat"
          color="white"
          text-color="primary"
          round
          push
          size="16px"
          @click.stop="onChatClick"
          class="q-ml-md"
        >
          <q-badge
            v-show="unreadMessageCount > 0"
            color="red"
            floating
            transparent
          >
            {{ unreadMessageCount }}
          </q-badge>
        </q-btn>
      </div>
      <gamepad
        ref="gamepad"
        style="position: absolute; bottom: 60px"
      />
    </template>
    <template v-else>
      <playfield ref="playfield">
        <text-overlay
          ref="textOverlay"
          class="absolute-center"
          style="z-index: 513;"
        />
        <text-overlay
          v-if="[1, 3].includes(gameState) && gameStatus.text"
          visible
          :text="gameStatus.text"
          class="absolute-center"
          style="z-index: 512;"
        />
        <div
          class="absolute-center full-width"
          style="position: absolute; top: calc(50% + 88px); z-index: 512;"
        >
          <slot name="main-overlay" />
        </div>
        <result-dialog
          ref="resultDialog"
          :show-again="!viewUser.isRoomOwner"
          class="absolute-center"
          style="z-index: 513;"
        />
        <div class="absolute-bottom-right">
          <div class="column justify-evenly q-gutter-y-sm">
            <template v-if="enableGameRuleButtons">
              <u-button
                v-if="canWithdraw"
                label="悔棋"
                color="warning"
                size="12px"
                :disable="!(isPlaying && withdrawEnabled)"
                :loading="confirmRequestLoadings[3]"
                @click="onWithdrawClick"
              />
              <u-button
                label="求和"
                color="warning"
                size="12px"
                :disable="!canChessDraw"
                :loading="confirmRequestLoadings[2]"
                @click="onChessDrawClick"
              />
              <u-button
                label="认输"
                color="warning"
                size="12px"
                :disable="!canWhiteFlag"
                @click="onWhiteFlagClick"
              />
            </template>
            <u-button
              icon="far fa-question-circle"
              color="warning"
              size="12px"
              title="帮助"
              @click="onHelpClick"
            />
            <u-button
              icon="settings"
              color="warning"
              size="12px"
              title="设置"
              @click="onSettingsClick"
            />
          </div>
        </div>
        <gamepad
          ref="gamepad"
          class="absolute-bottom"
        />
      </playfield>
      <div
        ref="controls"
        class="controls"
      >
        <q-card
          flat
          class="q-mb-sm q-px-sm q-py-sm row items-center"
          style="user-select:none"
        >
          <span class="text-subtitle1">
            <span>{{ GAME_TYPE_MAP[gameType].text }} 房#</span>
            <span class="number">{{ room.id }}</span>
          </span>
          <span
            class="q-ml-sm"
            :style="{flexGrow: 1, width: '92px', color: gameStatus.color, userSelect: 'none'}"
          >{{ `[${gameStatus.text}]` }}</span>
          <spectator-count-display
            :count="spectatorCount"
            class="q-ml-sm"
          />
        </q-card>
        <div
          class="relative-position row user-panels q-gutter-y-xs q-mb-sm"
          :class="{reverse, dark: $q.dark.isActive}"
        >
          <game-user-panel
            ref="viewGameUserPanel"
            v-bind="viewUser"
            :game-type="gameType"
          />
          <game-user-panel
            ref="otherGameUserPanel"
            v-bind="otherUser"
            :game-type="gameType"
          />
          <vs-icon :animated="isPlaying" class="absolute-center" />
        </div>
        <chat-panel ref="chatPanel" />
        <q-btn-group
          unelevated
          spread
          class="q-mt-sm"
        >
          <slot name="main-buttons" />
          <template v-if="enableGameRuleButtons">
            <q-btn
              color="white"
              text-color="black"
              :disable="![2, 3].includes(gameState)"
              :loading="confirmRequestLoadings[isPlaying ? 4 : 5]"
              @click="onPauseOrResumeGameClick"
            >
              <span>
                <q-icon name="access_time" />
                <span class="q-ml-xs">{{ pauseOrResumeText }}</span>
              </span>
            </q-btn>
          </template>
          <q-btn
            color="primary"
            @click="onQuitClick"
          >
            <span>
              <q-icon name="keyboard_arrow_left" />
              退出房间
            </span>
          </q-btn>
        </q-btn-group>
      </div>
    </template>
  </q-page>
</template>

<script lang="ts">
import {
  computed, defineComponent, PropType,
} from '@vue/composition-api';
import GameState from 'src/online/play/GameState';
import Room from 'src/online/room/Room';
import ChineseChessDarkGameSettings from 'src/rulesets/chinesechess-dark/ChineseChessDarkGameSettings';
import Playfield from 'src/pages/play/Playfield.vue';
import ResultDialog from 'src/rulesets/ui/ResultDialog.vue';
import TextOverlay from 'src/rulesets/ui/TextOverlay.vue';
import Gamepad from 'src/rulesets/ui/Gamepad.vue';
import { GameType } from 'src/rulesets/GameType';
import GameUser from 'src/online/play/GameUser';
import VsIcon from 'src/rulesets/ui/VsIcon.vue';
import GameUserPanel from './GameUserPanel.vue';
import SpectatorCountDisplay from './SpectatorCountDisplay.vue';
import ChatPanel from './ChatPanel.vue';

export default defineComponent({
  components: {
    Playfield,
    GameUserPanel,
    SpectatorCountDisplay,
    ResultDialog,
    TextOverlay,
    ChatPanel,
    Gamepad,
    VsIcon,
  },
  inject: ['reload'],
  props: {
    room: {
      type: Object as PropType<Room>,
      required: true,
    },

    gameState: {
      type: Number as PropType<GameState>,
      required: true,
    },

    gameStatus: {
      type: Object as PropType<any>,
      required: true,
    },

    confirmRequestLoadings: {
      type: Object as PropType<any>,
    },

    canWithdraw: Boolean,

    withdrawEnabled: Boolean,

    viewUser: {
      type: Object as PropType<any>,
      required: true,
    },
    otherUser: {
      type: Object as PropType<any>,
      required: true,
    },

    reverse: Boolean,

    spectatorCount: {
      type: Number,
      required: true,
    },

    unreadMessageCount: {
      type: Number,
      required: true,
      default: 0,
    },

    enableGameRuleButtons: Boolean,
  },
  watch: {
    $route() {
      // eslint-disable-next-line
      (this.reload as any)();
    },
  },
  setup(props, { emit }) {
    const { gameSettings } = props.room.roomSettings;
    const { gameType } = gameSettings;

    const GAME_TYPE_MAP: {
      [n: number]: {text: string}
    } = {
      [GameType.chinesechess]: {
        text: '象棋',
      },
      [GameType.chinesechessDark]: {
        // todo: 消除硬编码
        text: `揭棋${(gameSettings as ChineseChessDarkGameSettings).fullRandom ? '(天命模式)' : ''}`,
      },
      [GameType.gobang]: {
        text: '五子棋',
      },
    };

    const isPlaying = computed(() => props.gameState == GameState.PLAYING);
    const canWhiteFlag = computed(() => (
      [GameState.PLAYING, GameState.PAUSE].includes(props.gameState)));
    const canChessDraw = computed(() => (
      // eslint-disable-next-line
      props.otherUser.online && [GameState.PLAYING, GameState.PAUSE].includes(props.gameState)));

    const pauseOrResumeText = computed(() => {
      let text = (props.viewUser as GameUser).isRoomOwner ? '' : '请求';
      text += `${props.gameState == GameState.PLAYING ? '暂停' : '继续'}游戏`;
      return text;
    });
    const onChatClick = () => {
      emit('chat');
    };
    const onWithdrawClick = () => {
      emit('withdraw');
    };
    const onChessDrawClick = () => {
      emit('chess-draw');
    };
    const onWhiteFlagClick = () => {
      emit('white-flag');
    };
    const onPauseOrResumeGameClick = () => {
      emit('pause-or-resume');
    };
    const onQuitClick = () => {
      emit('quit');
    };
    const onHelpClick = () => {
      emit('help');
    };

    const onSettingsClick = () => {
      emit('settings');
    };

    return {
      gameType,
      GAME_TYPE_MAP,
      isPlaying,
      pauseOrResumeText,
      canChessDraw,
      canWhiteFlag,

      onChatClick,
      onWithdrawClick,
      onChessDrawClick,
      onWhiteFlagClick,
      onHelpClick,
      onPauseOrResumeGameClick,
      onQuitClick,
      onSettingsClick,
    };
  },
});
</script>

<style lang="sass" scoped>
.q-page
  flex-wrap: nowrap

.xs-screen
  .fixed-bottom-right
    padding-right: 8px
    padding-bottom: 8px

  .fixed-bottom-left
    padding-left: 8px
    padding-bottom: 8px

  .absolute-top-left
    padding-left: 8px
    padding-top: 8px

.controls
  padding: 8px
  width: 390px
  min-width: 390px
  display: flex
  flex-direction: column
  min-height: inherit

  .user-panels
    justify-content: space-between
    .game-user-panel
      padding: 8px
      padding-bottom: 12px
      width: calc(50% - 4px)
      border-radius: 4px

    &:not(.dark)
      .game-user-panel
        background: #fff

    &.dark
      .game-user-panel
        background: #1d1d1d

  .chat-panel
    flex-grow: 1
</style>
<style scoped>
.q-btn-group >>> .q-btn__wrapper {
  padding: 0px;
}

.q-list {
  min-width: 160px;
}

.q-list >>> .q-item {
  font-size: 16px;
}

.q-list >>> label {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.q-list >>> .q-icon {
  font-size: 22px;
  margin-right: 6px;
}
</style>
