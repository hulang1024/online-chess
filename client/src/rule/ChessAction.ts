import Chess from "./Chess";
import ChessPos from "./ChessPos";
import ChessHost from "./chess_host";

export default class ChessAction {
  chessHost: ChessHost;

  chessType: any;

  fromPos: ChessPos;

  toPos: ChessPos;

  eatenChess: Chess;
}