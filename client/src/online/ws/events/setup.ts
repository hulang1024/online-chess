import Signal from "src/utils/signals/Signal";
import SocketService from "../SocketService";
import { roomCreated, roomRemoved, roomUpdated } from "./lobby";
import * as user from "./user";
import * as chat from './chat';
import * as spectator from './spectator';
import * as room_events from "./room";
import * as stat_events from "./stat";
import { chessMoved, chessPickup, confirmRequest, confirmResponse, gameContinue, gameContinueResponse, gameStarted, gameStates, readied } from "./play";

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

    ['room.user_join', room_events.userJoined],
    ['room.user_left', room_events.userLeft],

    ['play.ready', readied],
    ['play.game_start', gameStarted],
    ['play.chess_pick', chessPickup],
    ['play.chess_move', chessMoved],
    ['play.confirm_request', confirmRequest],
    ['play.confirm_response', confirmResponse],
    ['play.game_continue', gameContinue],
    ['play.game_continue_response', gameContinueResponse],
    ['play.game_states', gameStates],
    
    ['spectator.user_join', spectator.joined],
    ['spectator.user_left', spectator.left],

    ['stat.online', stat_events.online],

  ].forEach(([type, signal]) => {
    socketService.addEvent(<string>type, <Signal>signal);
  });
}