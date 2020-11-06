import Chess from "./Chess";
import ChessPos from "./ChessPos";

/**
 * 棋盘
 */
export default interface Chessboard {
    isEmpty: (row: number, col: number) => boolean;

    chessAt: (row: number, col: number) => Chess;

    /**
     * 加一个棋子
     * @param chess
     */
    addChess: (chess: Chess) => void;

    /**
     * 移动棋子，并能修改chess本身的位置为destPos
     * @param chess
     * @param destPos
     */
    moveChess: (chess: Chess, pos: ChessPos) => void;

    removeChess: (chess: Chess) => void;

    getChessList: () => Array<Chess>;

    clear: () => void;
}

export const CHESSBOARD_ROW_NUM = 10;
export const CHESSBOARD_COL_NUM = 9;