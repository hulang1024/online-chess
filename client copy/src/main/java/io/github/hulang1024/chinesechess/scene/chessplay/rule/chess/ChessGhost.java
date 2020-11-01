package io.github.hulang1024.chinesechess.scene.chessplay.rule.chess;

import io.github.hulang1024.chinesechess.scene.chessplay.rule.ChessPosition;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.HostEnum;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.RoundGame;

/**
 * 表示一个空棋
 * @author Hu Lang
 */
public class ChessGhost extends AbstractChess {
    public ChessGhost(ChessPosition pos) {
        super(pos, null);
    }

    public ChessGhost(ChessPosition pos, HostEnum host) {
        super(pos, host);
    }

    @Override
    public boolean canGoTo(ChessPosition destPos, RoundGame game) {
        return false;
    }
}
