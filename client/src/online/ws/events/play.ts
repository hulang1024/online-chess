import Room from "src/online/room/Room";
import Signal from "../../../utils/signals/Signal";
import ServerMsg from "../ServerMsg";

export let readied = new Signal();
export let gameStarted = new Signal();
export let chessPickup = new Signal();
export let chessMoved = new Signal();
export let confirmRequest = new Signal();
export let confirmResponse = new Signal();
export let gameContinue = new Signal();
export let gameStates = new Signal();
export let gameContinueResponse = new Signal();


export interface GameReadyMsg extends ServerMsg {
  uid: number;
  readied: boolean;
}

export interface GameStartedMsg extends ServerMsg {
  redChessUid: number;
  blackChessUid: number;
}

export interface ChessPickUpMsg extends ServerMsg {
  pickup: boolean;
  pos: ServerMsgPos;
  chessHost: number;
}

export interface ChessMoveMsg extends ServerMsg {
  moveType: number;
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

export default interface ResponseGameStates {
  room: Room;
  chesses: Array<ResponseGameStateChess>;
  activeChessHost: number;
  actionStack: Array<any>;
}

export interface ResponseGameStateChess {
  row: number;
  col: number;
  chessHost: number;
  type: string;
}

export interface ResponseGameStateChessAction {
  chessHost: string;
  chessType: string;
  type: string;
  fromPos: ResponseChessPos,
  toPos: ResponseChessPos,
  eatenChess: ResponseGameStateChess
}

export interface ResponseChessPos {
  row: number;
  col: number;
}

interface ServerMsgPos {
  row: number;
  col: number;
}