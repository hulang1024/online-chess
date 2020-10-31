package io.github.hulang1024.chinesechess.scene.chessplay.rule;

/**
 * 棋子
 * @author Hu Lang
 */
public interface Chess {

    /**
     * 设置位置
     * @param pos
     * @return
     */
    void setPos(ChessPosition pos);

    /**
     * 设置棋方
     * @param host
     * @return
     */
    void setHost(HostEnum host);

    /**
     * 位置
     * @return
     */
    ChessPosition pos();

    /**
     * 棋方
     * @return
     */
    HostEnum host();

    /**
     * 判断指定位置是否可走。
     * 不考虑指定位置是否为空或有棋子，不应包含全局规则。
     * @param destPos
     * @param game
     * @return
     */
    boolean canGoTo(ChessPosition destPos, RoundGame game);
}
