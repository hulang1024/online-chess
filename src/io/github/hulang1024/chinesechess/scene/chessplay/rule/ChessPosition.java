package io.github.hulang1024.chinesechess.scene.chessplay.rule;

/**
 * 棋子位置
 * @author Hu Lang
 */
public class ChessPosition {
    /**
     * 行，从0开始数
     */
    public int row;

    /**
     * 列，从0开始数
     */
    public int col;

    public ChessPosition(int row, int col) {
        this.row = row;
        this.col = col;
    }
}
