import ResponseGameStates from "src/online/play/game_states_response";
import Signal from "../../../utils/signals/Signal";
import ServerMsg from "../ServerMsg";

export const readied = new Signal();
export const gameStarted = new Signal();
export const gamePause = new Signal();
export const gameResume = new Signal();
export const gameOver = new Signal();
export const chessPickup = new Signal();
export const chessMoved = new Signal();
export const chessWithdraw = new Signal();
export const confirmRequest = new Signal();
export const confirmResponse = new Signal();
export const gameContinue = new Signal();
export const gameStates = new Signal();
export const gameContinueResponse = new Signal();

export interface GameReadyMsg extends ServerMsg {
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

export interface ChessPickUpMsg extends ServerMsg {
  pickup: boolean;
  pos: ServerMsgPos;
  chessHost: number;
}

export interface ChessMoveMsg extends ServerMsg {
  chessHost: number;
  fromPos: ServerMsgPos;
  toPos: ServerMsgPos;
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

interface ServerMsgPos {
  row: number;
  col: number;
}
