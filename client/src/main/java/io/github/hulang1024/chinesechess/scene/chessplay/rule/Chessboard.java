package io.github.hulang1024.chinesechess.scene.chessplay.rule;

import io.github.hulang1024.chinesechess.scene.chessplay.DrawableChess;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.chess.AbstractChess;

/**
 * 棋盘
 * @author Hu Lang
 */
public interface Chessboard {
    int ROW_NUM = 10;
    int COL_NUM = 9;

    /**
     * 指定位置是否为空位
     * @param row
     * @param col
     * @return
     */
    boolean isEmpty(int row, int col);

    /**
     * 获取指定位置上棋子
     * @param pos
     * @return
     */
    AbstractChess chessAt(ChessPosition pos);

    /**
     * 获取指定位置上棋子
     * @param row
     * @param col
     * @return
     */
    AbstractChess chessAt(int row, int col);

    /**
     * 加一个棋子
     * @param chess
     */
    void addChess(AbstractChess chess);

    /**
     * 清空棋盘棋子
     */
    void clear();
}
