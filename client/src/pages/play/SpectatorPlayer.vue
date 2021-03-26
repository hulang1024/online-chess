<template>
  <player-view
    ref="playerView"
    :room="room"
    :game-state="gameState"
    :game-status="gameStatus"
    :view-user="viewUser"
    :other-user="otherUser"
    :spectator-count="spectatorCount"
    :unread-message-count="unreadMessageCount"
    :enable-game-rule-buttons="false"
    :reverse="reverse"
    @quit="onQuitClick"
    @chat="onChatClick"
    @help="onHelpClick"
  >
    <template #main-overlay>
      <main-buttons-overlay visible>
        <q-btn
          v-show="!(viewUser.user && otherUser.user)"
          push
          label="加入游戏"
          color="primary"
          @click="onJoinGameClick"
        />
      </main-buttons-overlay>
    </template>
    <template #xs-screen-main-buttons>
      <q-item
        v-if="[1, 3].includes(room.roomSettings.gameSettings.gameType)"
        clickable
        v-close-popup
        @click="onToggleViewClick"
      >
        <q-item-section>
          <q-item-label>
            <q-icon name="far fa-eye" />
            切换
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template #main-buttons>
      <q-btn
        v-if="[1, 3].includes(room.roomSettings.gameSettings.gameType)"
        label="切换"
        color="white"
        text-color="black"
        @click="onToggleViewClick"
      />
    </template>
  </player-view>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance } from '@vue/composition-api';
import SpectateResponse from 'src/online/spectator/APISpectateResponse';
import PlayerView from './PlayerView.vue';
import ReadyOverlay from './ReadyOverlay.vue';
import SpectatorPlayer from './SpectatorPlayer';
import { usePlayerStates } from './PlayerViewStates';
import MainButtonsOverlay from './MainButtonsOverlay.vue';

export default defineComponent({
  components: {
    PlayerView,
    ReadyOverlay,
    MainButtonsOverlay,
  },
  setup() {
    const context = getCurrentInstance() as Vue;
    const { spectateResponse } = context.$route.params as
      unknown as { spectateResponse: SpectateResponse };

    const player = new SpectatorPlayer(context, spectateResponse);

    return {
      room: spectateResponse.room,
      ...usePlayerStates(player),

      onToggleViewClick: player.onToggleViewClick.bind(player),
      onJoinGameClick: player.onJoinGameClick.bind(player),
    };
  },
});
</script>
