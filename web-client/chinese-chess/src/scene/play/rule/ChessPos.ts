/**
 * 棋子位置
 */
export default class ChessPos {
    /**
     * 棋盘纵坐标，从0开始数
     */
    readonly row: number;

    /**
     * 棋盘横坐标，从0开始数
     */
    readonly col: number;

    constructor(row: number, col: number) {
        this.row = row;
        this.col = col;
    }

    copy() {
        return new ChessPos(this.row, this.col);
    }
}