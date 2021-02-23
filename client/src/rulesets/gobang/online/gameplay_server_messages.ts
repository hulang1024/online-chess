import ResponseGameStates, { ResponseChessPos } from "src/rulesets/game_states_response";
import ServerMsg from "src/online/ws/ServerMsg";

export default interface GobangResponseGameStates extends ResponseGameStates {
  chesses: Array<ResponseGameStateChess>;
  actionStack: Array<ResponseGameStateChessAction>;
}

export interface ResponseGameStateChess {
  row: number;
  col: number;
  type: number;
}

export interface ResponseGameStateChessAction {
  chess: number;
  pos: ResponseChessPos,
}

export interface ChessPutMsg extends ServerMsg {
  pos: ResponseChessPos;
  chess: number;
}

export interface ChessTargetPosMsg extends ServerMsg {
  pos: ResponseChessPos;
  chess: number;
}
