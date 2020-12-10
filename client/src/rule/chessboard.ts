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

export const CHESSBOARD_ROW_NUM = 10;
export const CHESSBOARD_COL_NUM = 9;