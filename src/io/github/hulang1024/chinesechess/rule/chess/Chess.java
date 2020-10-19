package io.github.hulang1024.chinesechess.rule.chess;

import io.github.hulang1024.chinesechess.rule.AbstractChess;
import io.github.hulang1024.chinesechess.rule.ChessPosition;

/**
 * @author Hu Lang
 */
public class Chess extends AbstractChess {
    public static Chess NULL = new Chess();

    private Chess() {}

    @Override
    public boolean canGoTo(ChessPosition destPos) { return false; }
}
