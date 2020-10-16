package io.github.hulang1024.chinesechess.rule;

/**
 * 抽象的棋子
 * @author Hu Lang
 */
public abstract class AbstractChess {
    private Chessboard chessboard;
    /** 当前位置 */
    private ChessPosition pos;
    /** 所属队伍 */
    private HostEnum host;

    /**
     * 判断指定位置是否可走
     * @param destPos
     * @return
     */
    public abstract boolean canGoTo(ChessPosition destPos);

    /**
     * 判断是否可吃指定棋
     * @param chess
     * @return
     */
    public boolean canEat(AbstractChess chess) {
        return this.host != chess.host;
    }
}
