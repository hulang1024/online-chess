package io.github.hulang1024.chinesechess.scene.chessplay.rule.chess;

import io.github.hulang1024.chinesechess.scene.chessplay.rule.Chess;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.ChessPosition;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.HostEnum;

/**
 * 抽象的棋子
 * @author Hu Lang
 */
/*package*/ abstract class AbstractChess implements Chess {
    /** 当前位置 */
    protected ChessPosition pos;
    /** 所属棋方 */
    protected HostEnum host;

    public AbstractChess(ChessPosition pos, HostEnum host) {
        this.pos = pos;
        this.host = host;
    }

    @Override
    public void setPos(ChessPosition pos) {
        this.pos = pos;
    }

    @Override
    public void setHost(HostEnum host) {
        this.host = host;
    }

    @Override
    public ChessPosition pos() {
        return pos;
    }

    @Override
    public HostEnum host() {
        return host;
    }
}
