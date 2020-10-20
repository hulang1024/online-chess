package io.github.hulang1024.chinesechess.rule.chess;

import io.github.hulang1024.chinesechess.rule.AbstractChess;
import io.github.hulang1024.chinesechess.rule.ChessPosition;
import io.github.hulang1024.chinesechess.rule.ChineseChessGame;

/**
 * 象
 * @author Hu Lang
 */
public class ChessM extends AbstractChess {
    @Override
    public boolean canGoTo(ChessPosition destPos, ChineseChessGame game) {
        int rowOffset = destPos.row - pos.row;
        int colOffset = destPos.col - pos.col;

        // 不能过河（限制在本方阵地）
        return MoveRules.isInBoundary(game, host, destPos)
            // 只能走“田”
            && Math.abs(rowOffset) == 2 && Math.abs(colOffset) == 2
            // 同时“田”中心不能有棋子
            && (game.chessboard.isEmpty(
                pos.row + (rowOffset > 0 ? +1 : -1), pos.col + (colOffset > 0 ? +1 : -1)));
    }
}
