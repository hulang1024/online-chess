import ResponseGameStates from "src/online/play/game_states_response";
import ServerMsg from "../ws/ServerMsg";

export interface ResultsReadyMsg extends ServerMsg {
  uid: number;
  readied: boolean;
}

export interface GameStartedMsg extends ServerMsg {
  redChessUid: number;
  blackChessUid: number;
}

export interface GameOverMsg extends ServerMsg {
  winUserId: number;
  timeout: boolean;
}

export interface ConfirmRequestMsg extends ServerMsg {
  reqType: number;
  chessHost: number;
}

export interface ConfirmResponseMsg extends ServerMsg {
  reqType: number;
  chessHost: number;
  ok: boolean
}

export interface GameContinueResponseMsg extends ServerMsg {
  uid: number;
  ok: boolean;
}

export interface GameStatesMsg extends ServerMsg {
  states: ResponseGameStates
}
