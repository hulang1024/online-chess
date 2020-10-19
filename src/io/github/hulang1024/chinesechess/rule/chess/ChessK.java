package io.github.hulang1024.chinesechess.rule.chess;

import io.github.hulang1024.chinesechess.rule.AbstractChess;
import io.github.hulang1024.chinesechess.rule.ChessPosition;

/**
 * 将
 * @author Hu Lang
 */
public class ChessK extends AbstractChess {
    @Override
    public boolean canGoTo(ChessPosition destPos) {
        // 可以在九宫内走单步，不限制方向（包括斜着走）
        return Math.abs(destPos.row - pos.row) <= 1 && Math.abs(destPos.col - pos.col) <= 1
            && isInKingHome(this, destPos);
    }

    /**
     * 在九宫格内
     * @param chess
     * @param destPos
     * @return
     */
    public static boolean isInKingHome(AbstractChess chess, ChessPosition destPos) {
        //TODO:
        return true;
    }
}
