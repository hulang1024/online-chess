<template>
  <player-view
    ref="playerView"
    :room="room"
    :game-state="gameState"
    :game-status="gameStatus"
    :is-playing="isPlaying"
    :can-withdraw="canWithdraw"
    :view-user="viewUser"
    :other-user="otherUser"
    :spectator-count="spectatorCount"
    :enable-game-rule-buttons="false"
    :reverse="reverse"
    @quit="onQuitClick"
    @chat="onChatClick"
  >
    <template #xs-screen-main-buttons>
      <q-item
        clickable
        v-close-popup
        @click="onToggleViewClick"
      >
        <q-item-section>切换</q-item-section>
      </q-item>
      <q-separator />
    </template>
    <template #main-buttons>
      <u-button
        label="切换"
        color="warning"
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
import { usePlayerStates } from './PlayerComponentStates';

export default defineComponent({
  components: {
    PlayerView,
    ReadyOverlay,
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
    };
  },
});
</script>
