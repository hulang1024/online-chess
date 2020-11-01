package io.github.hulang1024.chinesechess.scene.chessplay.rule;


import java.util.List;

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
     * @param row
     * @param col
     * @return
     */
    Chess chessAt(int row, int col);

    /**
     * 加一个棋子
     * @param chess
     */
    void addChess(Chess chess);

    /**
     * 移动棋子，并能修改chess本身的位置为destPos
     * @param chess
     * @param destPos
     */
    void moveChess(Chess chess, ChessPosition destPos);

    /**
     * 移除棋子
     * @param chess
     */
    void removeChess(Chess chess);

    /**
     * 获取棋子列表
     */
    List<Chess> getChessList();

    /**
     * 清空棋盘棋子
     */
    void clear();
}
