package io.github.hulang1024.chinesechess.rule.chess;

import io.github.hulang1024.chinesechess.rule.AbstractChess;
import io.github.hulang1024.chinesechess.rule.ChessPosition;
import io.github.hulang1024.chinesechess.rule.ChineseChessGame;

/**
 * 马
 * @author Hu Lang
 */
public class ChessN extends AbstractChess {
    @Override
    public boolean canGoTo(ChessPosition destPos, ChineseChessGame game) {
        // 马走“日”，蹩马腿
        int rowOffset = destPos.row - pos.row;
        int colOffset = destPos.col - pos.col;

        if (Math.abs(rowOffset) == 2 && Math.abs(colOffset) == 1) {
            return game.chessboard.isEmpty(pos.row + (rowOffset > 0 ? +1 : -1), pos.col);
        } else if (Math.abs(rowOffset) == 1 && Math.abs(colOffset) == 2) {
            return game.chessboard.isEmpty(pos.row, pos.col + (colOffset > 0 ? +1 : -1));
        } else {
            return false;
        }
    }
}
