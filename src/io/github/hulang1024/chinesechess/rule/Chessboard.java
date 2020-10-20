package io.github.hulang1024.chinesechess.rule;

/**
 * 棋盘
 * @author Hu Lang
 */
public class Chessboard {
    public static final int ROW_NUM = 10;
    public static final int COL_NUM = 9;

    private AbstractChess[][] chessArray = new AbstractChess[ROW_NUM][COL_NUM];


    /**
     * 指定位置是否为空位
     * @param row
     * @param col
     * @return
     */
    public boolean isEmpty(int row, int col) {
        return chessAt(row, col) == null;
    }

    /**
     * 获取指定位置上棋子
     * @param pos
     * @return
     */
    public AbstractChess chessAt(ChessPosition pos) {
        return chessAt(pos.row, pos.col);
    }

    /**
     * 获取指定位置上棋子
     * @param row
     * @param col
     * @return
     */
    public AbstractChess chessAt(int row, int col) {
        return chessArray[row][col];
    }
}
