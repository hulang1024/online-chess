package io.github.hulang1024.chinesechess.rule;

/**
 * 抽象的棋子
 * @author Hu Lang
 */
public abstract class AbstractChess {
    /** 当前位置 */
    public ChessPosition pos;
    /** 所属军方 */
    public HostEnum host;

    /**
     * 判断指定位置是否可走。
     * 不考虑指定位置是否为空或有棋子，不应包含全局规则。
     * @param destPos
     * @param game
     * @return
     */
    public abstract boolean canGoTo(ChessPosition destPos, ChineseChessGame game);
}
