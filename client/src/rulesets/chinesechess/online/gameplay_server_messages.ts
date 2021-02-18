import ServerMsg from "src/online/ws/ServerMsg";

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

interface ServerMsgPos {
  row: number;
  col: number;
}
