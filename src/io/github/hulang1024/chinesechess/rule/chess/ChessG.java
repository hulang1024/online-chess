package io.github.hulang1024.chinesechess.rule.chess;

import io.github.hulang1024.chinesechess.rule.AbstractChess;
import io.github.hulang1024.chinesechess.rule.ChessPosition;

/**
 * 士
 * @author Hu Lang
 */
public class ChessG extends AbstractChess {
    @Override
    public boolean canGoTo(ChessPosition destPos) {
        // 只许沿九宫斜线走单步，可进可退
        return Math.abs(destPos.row - pos.row) == 1 && Math.abs(destPos.col - pos.col) == 1
            && ChessK.isInKingHome(this, destPos);
    }
}
