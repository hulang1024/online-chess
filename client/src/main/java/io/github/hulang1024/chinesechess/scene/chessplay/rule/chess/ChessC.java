package io.github.hulang1024.chinesechess.scene.chessplay.rule.chess;

import io.github.hulang1024.chinesechess.scene.chessplay.rule.ChessPosition;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.HostEnum;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.RoundGame;

/**
 * 炮
 * @author Hu Lang
 */
public class ChessC extends AbstractChess {
    public ChessC(ChessPosition pos, HostEnum host) {
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

        // 到目标位置之间的存在的棋子数量
        int chessCount = 0;
        if (Math.abs(rowOffset) > 0) {
            int k = rowOffset > 0 ? +1 : -1;
            for (int row = pos.row + k; row != destPos.row + k; row += k) {
                if (!game.getChessboard().isEmpty(row, pos.col)) {
                    chessCount++;
                }
            }
        } else {
            int k = colOffset > 0 ? +1 : -1;
            for (int col = pos.col + k; col != destPos.col + k; col += k) {
                if (!game.getChessboard().isEmpty(pos.row, col)) {
                    chessCount++;
                }
            }
        }

        return game.getChessboard().isEmpty(destPos.row, destPos.col)
            // 如果目标位置上有棋子，那么到目标位置之间必须没有棋子
            ? chessCount == 0
            // 否则，是准备吃子，则中间必选有且只有一个棋子
            : chessCount == 1;
    }
}
