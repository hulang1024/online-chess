import Room from "../room/Room";

export default interface ResponseGameStates {
  room: Room;
  chesses: Array<ResponseGameStateChess>;
  activeChessHost: number;
  actionStack: Array<ResponseGameStateChessAction>;
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