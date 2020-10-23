package io.github.hulang1024.chinesechess.scene.chessplay.rule;

import io.github.hulang1024.chinesechess.scene.chessplay.rule.chess.ChessGhost;
import org.junit.Before;

/**
 * @author Hu Lang
 */
public class ChessRuleTests {
    private Chessboard chessboard = null;

    @Before
    public void init() {
        for (int row = 0; row < Chessboard.ROW_NUM; row++) {
            for (int col = 0; col < Chessboard.COL_NUM; col++) {
                chessboard.addChess(new ChessGhost(new ChessPosition(row, col)));
            }
        }
    }
}
