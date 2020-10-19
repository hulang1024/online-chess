package io.github.hulang1024.chinesechess.rule.chess;

import io.github.hulang1024.chinesechess.rule.AbstractChess;
import io.github.hulang1024.chinesechess.rule.ChessPosition;

/**
 * 象
 * @author Hu Lang
 */
public class ChessM extends AbstractChess {
    @Override
    public boolean canGoTo(ChessPosition destPos) {
        // 走“田”同时“田”中心不能有棋子，不能过河（限制在本方阵地）
        return false;
    }
}
