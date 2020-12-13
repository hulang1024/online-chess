import Signal from "src/utils/signals/Signal";
import SocketService from "../SocketService";
import { roomCreated, roomRemoved, roomUpdated } from "./lobby";
import * as user from "./user";
import * as chat from './chat';
import * as spectator from './spectator';
import * as RoomEvents from "./room";
import * as stat from "./stat";
import * as play from "./play";

export function setupEvents(socketService: SocketService) {
  [
    ['user.login', user.loggedIn],
    ['user.online', user.online],
    ['user.offline', user.offline],
    ['user.status_changed', user.statusChanged],

    ['lobby.room_create', roomCreated],
    ['lobby.room_update', roomUpdated],
    ['lobby.room_remove', roomRemoved],

    ['chat.message', chat.message],
    ['chat.presence', chat.presence],
    ['chat.user_left', chat.channelUserLeft],
    ['chat.recall_message', chat.messageRecalled],

    ['room.user_join', RoomEvents.userJoined],
    ['room.user_left', RoomEvents.userLeft],

    ['play.ready', play.readied],
    ['play.game_start', play.gameStarted],
    ['play.game_over', play.gameOver],
    ['play.chess_pick', play.chessPickup],
    ['play.chess_move', play.chessMoved],
    ['play.confirm_request', play.confirmRequest],
    ['play.confirm_response', play.confirmResponse],
    ['play.game_continue', play.gameContinue],
    ['play.game_continue_response', play.gameContinueResponse],
    ['play.game_states', play.gameStates],

    ['spectator.user_join', spectator.joined],
    ['spectator.user_left', spectator.left],

    ['stat.online', stat.online],

  ].forEach(([type, signal]) => {
    socketService.addEvent(<string>type, <Signal>signal);
  });
}
