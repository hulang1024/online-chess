package io.github.hulang1024.chinesechess.scene.chessplay;

import io.github.hulang1024.chinesechess.scene.chessplay.rule.Player;
import javafx.scene.Parent;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.StackPane;

/**
 * 游戏下棋主场景
 * @author Hu Lang
 */
public class ChessPlayScene extends GridPane {
    public Chessboard chessboard = new Chessboard();
    private Player player1;
    private Player player2;

    public ChessPlayScene() {
        add(chessboard, 0, 0);
    }

    public void startRound() {
        resetChessLayout();

    }

    private void resetChessLayout() {

    }
}
