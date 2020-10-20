package io.github.hulang1024.chinesechess.scene.chessplay.rule.chess;

import io.github.hulang1024.chinesechess.scene.chessplay.rule.ChessPosition;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.HostEnum;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.MoveRules;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.RoundGame;

/**
 * 车
 * @author Hu Lang
 */
public class ChessR extends AbstractChess {
    public ChessR(ChessPosition pos, HostEnum host) {
        super(pos, host);
    }

    @Override
    public boolean canGoTo(ChessPosition destPos, RoundGame game) {
        int rowOffset = destPos.row - pos.row;
        int colOffset = destPos.col - pos.col;

        // 进退都可以，但必须直线走
        if (!MoveRules.isStraightLineMove(rowOffset, colOffset, MoveRules.MAX_DISTANCE)) {
            return false;
        }

        // 只要到目标位置之间没有棋子
        if (Math.abs(rowOffset) > 0) {
            for (int row = pos.row; row != destPos.row; row += rowOffset) {
                if (!game.chessboard.isEmpty(row, pos.col)) {
                    return false;
                }
            }
        } else {
            for (int col = pos.col; col != destPos.col; col += colOffset) {
                if (!game.chessboard.isEmpty(pos.row, col)) {
                    return false;
                }
            }
        }

        return true;
    }
}
