package io.github.hulang1024.chinesechess.rule.chess;

import io.github.hulang1024.chinesechess.rule.AbstractChess;
import io.github.hulang1024.chinesechess.rule.ChessPosition;
import io.github.hulang1024.chinesechess.rule.ChineseChessGame;

/**
 * 炮
 * @author Hu Lang
 */
public class ChessC extends AbstractChess {
    @Override
    public boolean canGoTo(ChessPosition destPos, ChineseChessGame game) {
        int rowOffset = destPos.row - pos.row;
        int colOffset = destPos.col - pos.col;

        // 进退都可以，但必须直线走
        if (!MoveRules.isStraightLineMove(rowOffset, colOffset, MoveRules.MAX_DISTANCE)) {
            return false;
        }

        // 到目标位置之间的存在的棋子数量
        int chessCount = 0;
        if (Math.abs(rowOffset) > 0) {
            for (int row = pos.row; row != destPos.row; row += rowOffset) {
                if (!game.chessboard.isEmpty(row, pos.col)) {
                    chessCount++;
                }
            }
        } else {
            for (int col = pos.col; col != destPos.col; col += colOffset) {
                if (!game.chessboard.isEmpty(pos.row, col)) {
                    chessCount++;
                }
            }
        }

        AbstractChess chessAtDestPos = game.chessboard.chessAt(destPos);
        return chessAtDestPos != null && chessAtDestPos.host != host
            // 如果目标位置上有棋子，是准备吃子，则中间必选有且只有一个棋子
            ? chessCount == 1
            // 否则，可以到目标位置之间必须没有棋子
            : chessCount == 0;
    }
}
