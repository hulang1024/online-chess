import ResponseGameStates, { ResponseChessPos } from "src/rulesets/game_states_response";
import ServerMsg from "src/online/ws/ServerMsg";

export default interface ChineseChessResponseGameStates extends ResponseGameStates {
  chesses: Array<ResponseGameStateChess>;
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

export interface ChessPickUpMsg extends ServerMsg {
  pickup: boolean;
  pos: ResponseChessPos;
  chessHost: number;
}

export interface ChessMoveMsg extends ServerMsg {
  chessHost: number;
  fromPos: ResponseChessPos;
  toPos: ResponseChessPos;
}
