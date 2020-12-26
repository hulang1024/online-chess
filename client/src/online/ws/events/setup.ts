import Signal from "src/utils/signals/Signal";
import SocketService from "../SocketService";
import * as lobby from "./lobby";
import * as user from "./user";
import * as chat from './chat';
import * as spectator from './spectator';
import * as room from "./room";
import * as stat from "./stat";
import * as play from "./play";
import * as invitation from "./invitation";

export function setupEvents(socketService: SocketService) {
  [
    ['user.login', user.loggedIn],
    ['user.online', user.online],
    ['user.offline', user.offline],
    ['user.status_changed', user.statusChanged],

    ['lobby.room_create', lobby.roomCreated],
    ['lobby.room_update', lobby.roomUpdated],
    ['lobby.room_remove', lobby.roomRemoved],

    ['chat.message', chat.message],
    ['chat.presence', chat.presence],
    ['chat.user_left', chat.channelUserLeft],
    ['chat.recall_message', chat.messageRecalled],

    ['room.user_join', room.userJoined],
    ['room.user_left', room.userLeft],

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

    ['spectator.join', spectator.joined],
    ['spectator.left', spectator.left],

    ['invitation.new', invitation.invitation],
    ['invitation.reply', invitation.reply],

    ['stat.online', stat.online],

  ].forEach(([type, signal]) => {
    socketService.addEvent(<string>type, <Signal>signal);
  });
}
