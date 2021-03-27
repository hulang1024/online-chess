<template>
  <player-view
    ref="playerView"
    :room="room"
    :game-state="gameState"
    :game-status="gameStatus"
    :confirm-request-loadings="confirmRequestLoadings"
    :can-withdraw="canWithdraw"
    :withdraw-enabled="withdrawEnabled"
    :view-user="viewUser"
    :other-user="otherUser"
    :spectator-count="spectatorCount"
    :unread-message-count="unreadMessageCount"
    enable-game-rule-buttons
    @quit="onQuitClick"
    @chat="onChatClick"
    @withdraw="onWithdrawClick"
    @white-flag="onWhiteFlagClick"
    @chess-draw="onChessDrawClick"
    @help="onHelpClick"
    @pause-or-resume="onPauseOrResumeGameClick"
    @settings="onSettingsClick"
  >
    <template #main-overlay>
      <ready-overlay
        :ready="viewUser.ready"
        :other-ready="otherUser.ready"
        :is-room-owner="viewUser.isRoomOwner"
        :is-room-open="!(viewUser.user && otherUser.user)"
        :game-state="gameState"
        @invite="onInviteClick"
        @ready-start="onReadyStartClick"
        @quit="onQuitClick"
        @to-spectate="onToSpectateClick"
      />
    </template>
  </player-view>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance } from '@vue/composition-api';
import Room from 'src/online/room/Room';
import ResponseGameStates from 'src/rulesets/online/game_states_response';
import PlayerView from './PlayerView.vue';
import ReadyOverlay from './ReadyOverlay.vue';
import Player from './Player';
import { usePlayerStates } from './PlayerViewStates';

export default defineComponent({
  components: {
    PlayerView,
    ReadyOverlay,
  },
  setup() {
    const context = getCurrentInstance() as Vue;
    const { params } = context.$route;

    const room = params.room as unknown as Room;
    const player = new Player(context, room,
      false,
      params.initialGameStates as unknown as ResponseGameStates);

    return {
      room,

      ...usePlayerStates(player),

      onReadyStartClick: player.onReadyStartClick.bind(player),
      onToSpectateClick: player.onToSpectateClick.bind(player),
      onWithdrawClick: player.onWithdrawClick.bind(player),
      onChessDrawClick: player.onChessDrawClick.bind(player),
      onWhiteFlagClick: player.onWhiteFlagClick.bind(player),
      onPauseOrResumeGameClick: player.onPauseOrResumeGameClick.bind(player),
    };
  },
});
</script>
