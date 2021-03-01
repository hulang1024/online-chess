import Chess from "./rule/Chess";
import ChessPos from "./rule/ChessPos";
import ChessHost from "../chess_host";

export default class ChessAction {
  chessHost: ChessHost;

  chessType: any;

  fromPos: ChessPos;

  toPos: ChessPos;

  eatenChess: Chess | null;
}
