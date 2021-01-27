import Chess from "./Chess";
import ChessPos from "./ChessPos";

/**
 * 棋盘
 */
export default interface Chessboard {
  isEmpty: (row: number, col: number) => boolean;

  chessAt: (pos: ChessPos) => Chess | null;

  getChessArray: () => Array<Array<Chess | null>>;

  getChessList: () => Array<Chess>;
}
