<template>
  <q-page :class="[isXSScreen ? 'xs-screen' : 'row items-center q-pl-sm']">
    <template v-if="isXSScreen">
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
        >
          <spectator-count-display :count="spectatorCount" />
        </q-card>
      </div>
      <playfield
        ref="playfield"
        class="absolute-center"
      >
        <div
          v-if="gameState == 1"
          class="absolute-center q-py-xs text-subtitle1 ready-info"
        >{{ gameStatus.text }}</div>
        <text-overlay
          ref="textOverlay"
          class="absolute-center"
        />
        <result-dialog ref="resultDialog" />
        <div class="full-width" style="position: absolute; bottom: 30%">
          <slot name="ready-overlay" />
        </div>
      </playfield>
      <div
        class="fixed-bottom-left"
        style="padding-left: 12px; padding-bottom: 12px"
      >
        <q-btn
          icon="menu"
          round
          color="white"
          text-color="primary"
        >
          <q-menu
            transition-show="jump-up"
            transition-hide="jump-down"
            :offset="[0, 8]"
            auto-close
          >
            <q-list style="min-width: 110px">
              <template v-if="enableGameRuleButtons">
                <q-item
                  clickable
                  v-close-popup
                  :disable="!(isPlaying && canWithdraw)"
                  @click="onWithdrawClick"
                >
                  <q-item-section>
                    <q-item-label><q-icon name="redo" /> 悔棋</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item
                  clickable
                  v-close-popup
                  :disable="!isPlaying"
                  @click="onChessDrawClick"
                >
                  <q-item-section>
                    <q-item-label><q-icon name="mood" /> 求和</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item
                  clickable
                  v-close-popup
                  :disable="!isPlaying"
                  @click="onWhiteFlagClick"
                >
                  <q-item-section>
                    <q-item-label><q-icon name="mood_bad" /> 认输</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item
                  v-close-popup
                  clickable
                  :disable="![2, 3].includes(gameState)"
                  @click="onPauseOrResumeGameClick"
                >
                  <q-item-section>
                    <q-item-label>
                      <q-icon name="access_time" />
                      {{ viewUser.isRoomOwner ? '' : '请求' }}{{ gameState != 3 ? '暂停对局' : '继续对局' }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
              </template>
              <slot name="xs-screen-main-buttons" />
              <q-item
                clickable
                v-close-popup
                @click="onQuitClick"
              >
                <q-item-section>
                  <label><q-icon name="keyboard_arrow_left" />离开</label>
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
          @click.stop="onChatClick"
          class="q-ml-lg"
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
    </template>
    <template v-else>
      <playfield ref="playfield">
        <text-overlay
          ref="textOverlay"
          class="absolute-center"
        />
        <result-dialog ref="resultDialog" />
        <div class="absolute-center full-width">
          <slot name="ready-overlay" />
        </div>
      </playfield>
      <div
        ref="controls"
        class="controls"
      >
        <q-card
          flat
          class="q-mb-xs q-px-sm q-py-sm row items-center"
          style="user-select:none"
        >
          <span class="text-subtitle1">
            <span>棋桌#</span>
            <span>{{ room.id }}</span>
          </span>
          <span
            class="q-ml-sm"
            :style="{width: '92px', color: gameStatus.color, userSelect: 'none'}"
          >{{ `[${gameStatus.text}]` }}</span>
          <spectator-count-display
            :count="spectatorCount"
            class="q-ml-sm"
          />
          <u-button
            icon="menu"
            flat
            color="primary"
            padding="6px 10px"
            class="absolute-right"
          >
            <q-menu
              transition-show="jump-up"
              transition-hide="jump-down"
              auto-close
            >
              <q-list style="min-width: 140px">
                <q-item
                  clickable
                  v-close-popup
                  @click="onQuitClick"
                >
                  <q-item-section>
                    <q-item-label><q-icon name="keyboard_arrow_left" />离开</q-item-label>
                  </q-item-section>
                </q-item>
                <template v-if="enableGameRuleButtons">
                  <q-separator />
                  <q-item
                    v-close-popup
                    clickable
                    :disable="![2, 3].includes(gameState)"
                    @click="onPauseOrResumeGameClick"
                  >
                    <q-item-section>
                      <q-item-label>
                        <q-icon name="access_time" />
                        {{ viewUser.isRoomOwner ? '' : '请求' }}{{ gameState != 3 ? '暂停对局' : '继续对局' }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-menu>
          </u-button>
        </q-card>
        <q-card
          flat
          class="q-mb-xs q-px-sm q-py-sm column"
          :class="{reverse}"
          style="padding-left: 12px"
        >
          <game-user-panel
            ref="otherGameUserPanel"
            v-bind="otherUser"
            :game-type="gameType"
          />
          <q-separator class="q-my-sm" />
          <game-user-panel
            ref="viewGameUserPanel"
            v-bind="viewUser"
            :game-type="gameType"
          />
        </q-card>
        <q-card
          flat
          class="q-mb-xs q-py-sm"
        >
          <div class="flex justify-evenly q-gutter-y-sm">
            <template v-if="enableGameRuleButtons">
              <u-button
                label="悔棋"
                color="warning"
                :disable="!(isPlaying && canWithdraw)"
                @click="onWithdrawClick"
              />
              <u-button
                label="求和"
                color="warning"
                :disable="!isPlaying"
                @click="onChessDrawClick"
              />
              <u-button
                label="认输"
                color="warning"
                :disable="!isPlaying"
                @click="onWhiteFlagClick"
              />
            </template>
            <slot name="main-buttons" />
          </div>
        </q-card>

        <chat-panel ref="chatPanel" />
      </div>
    </template>
  </q-page>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, PropType,
} from '@vue/composition-api';
import GameState from 'src/online/play/GameState';
import Room from 'src/online/room/Room';
import Playfield from 'src/pages/play/Playfield.vue';
import ResultDialog from 'src/rulesets/ui/ResultDialog.vue';
import TextOverlay from 'src/rulesets/ui/TextOverlay.vue';
import GameUser from 'src/online/play/GameUser';
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

    isPlaying: Boolean,

    canWithdraw: Boolean,

    viewUser: {
      type: Object as PropType<GameUser>,
      required: true,
    },
    otherUser: {
      type: Object as PropType<GameUser>,
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
    const context = getCurrentInstance() as Vue;
    const isXSScreen = context.$q.screen.xs;
    const { gameType } = props.room.roomSettings.gameSettings;

    const onChatClick = () => {
      emit('chat')
    };
    const onWithdrawClick = () => {
      emit('withdraw');
    };
    const onChessDrawClick = () => {
      emit('chess-draw');
    }
    const onWhiteFlagClick = () => {
      emit('white-flag');
    }
    const onPauseOrResumeGameClick = () => {
      emit('pause-or-resume');
    };
    const onQuitClick = () => {
      emit('quit');
    };

    return {
      isXSScreen,
      gameType,

      onChatClick,
      onWithdrawClick,
      onChessDrawClick,
      onWhiteFlagClick,
      onPauseOrResumeGameClick,
      onQuitClick,
    };
  },
});
</script>

<style lang="sass" scoped>
.q-page
  flex-wrap: nowrap

.xs-screen
  .ready-info
    width: calc(100% - 1px)
    text-align: center
    color: white
    font-weight: bold
    background: rgba(0,0,0,0.35)
    border-radius: 2px
    user-select: none
    pointer-events: none

  .fixed-bottom-right
    margin-right: 12px
    margin-bottom: 12px

  .absolute-top-left
    margin-left: 12px
    padding-top: 12px

.controls
  padding: 8px
  width: 320px
  min-width: 320px
  display: flex
  flex-direction: column
  min-height: inherit

  .chat-panel
    flex-grow: 1
</style>
