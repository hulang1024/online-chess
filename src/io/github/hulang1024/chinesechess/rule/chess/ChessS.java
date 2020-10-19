package io.github.hulang1024.chinesechess.rule.chess;

import io.github.hulang1024.chinesechess.rule.AbstractChess;
import io.github.hulang1024.chinesechess.rule.ChessPosition;
import io.github.hulang1024.chinesechess.rule.Chessboard;

/**
 * 兵
 * @author Hu Lang
 */
public class ChessS extends AbstractChess {
    @Override
    public boolean canGoTo(ChessPosition destPos) {
        // 是否向前单步
        boolean isForward = game.isHostAtChessboardTop(host)
            ? pos.col + 1 == destPos.col
            : pos.col - 1 == destPos.col;

        // 判断是否过了河
        if (game.isHostAtChessboardTop(host)
            ? destPos.row > Chessboard.HOST_BOUNDARY_ROW
            : destPos.row < Chessboard.HOST_BOUNDARY_ROW + 1) {
            // 过河之后既可以向前单步，也可以左或右移单步
            return isForward || Math.abs(destPos.col - pos.col) == 1;
        } else {
            // 过河之前只可以向前单步
            return isForward;
        }
    }
}
