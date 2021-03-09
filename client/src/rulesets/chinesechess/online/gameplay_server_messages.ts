import ResponseGameStates, { ResponseChessPos } from "src/rulesets/online/game_states_response";
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
  isFront: boolean;
}

export interface ResponseGameStateChessAction {
  chess: {
    chessHost: string;
    type: string;
    isFront: boolean;
  },
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
