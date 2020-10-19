package io.github.hulang1024.chinesechess.rule;

/**
 * 棋盘
 * @author Hu Lang
 */
public class Chessboard {
    public static final int ROW_NUM = 10;
    public static final int COL_NUM = 9;
    /** 河界内行数 */
    public static final int HOST_BOUNDARY_ROW = 4;

    private AbstractChess[][] chessArray = new AbstractChess[ROW_NUM][COL_NUM];

    public AbstractChess chessAt(ChessPosition pos) {
        return chessArray[pos.row][pos.col];
    }
}
