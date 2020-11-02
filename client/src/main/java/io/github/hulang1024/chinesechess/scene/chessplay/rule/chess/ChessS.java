package io.github.hulang1024.chinesechess.scene.chessplay.rule.chess;

import io.github.hulang1024.chinesechess.scene.chessplay.rule.ChessPosition;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.HostEnum;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.RoundGame;

/**
 * 兵
 * @author Hu Lang
 */
public class ChessS extends AbstractChess {
    public ChessS(ChessPosition pos, HostEnum host) {
        super(pos, host);
    }

    @Override
    public boolean canGoTo(ChessPosition destPos, RoundGame game) {
        int colOffset = Math.abs(destPos.col - pos.col);

        // 是否向前单步
        boolean isForward = colOffset == 0
            && (game.isHostAtChessboardTop(host)
                ? pos.row + 1 == destPos.row
                : pos.row - 1 == destPos.row);

        // 判断是否过了河
        if (MoveRules.isInBoundary(game, host, destPos)) {
            // 过河之前只可以向前单步
            return isForward;
        } else {
            // 过河之后既可以向前单步，也可以左或右移单步
            return isForward || colOffset == 1;
        }
    }
}
