package io.github.hulang1024.chinesechess.scene.chessplay;

import io.github.hulang1024.chinesechess.scene.chessplay.rule.ChessPosition;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.HostEnum;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.Player;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.chess.*;
import javafx.scene.Parent;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.StackPane;

import java.util.Arrays;

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

        HostEnum topHost = HostEnum.BLACK;
        HostEnum bottomHost = HostEnum.RED;
        Arrays.stream(new AbstractChess[]{
            // 顶部方
            new ChessR(new ChessPosition(0, 0), topHost),
            new ChessN(new ChessPosition(0, 1), topHost),
            new ChessM(new ChessPosition(0, 2), topHost),
            new ChessG(new ChessPosition(0, 3), topHost),
            new ChessK(new ChessPosition(0, 4), topHost),
            new ChessG(new ChessPosition(0, 5), topHost),
            new ChessM(new ChessPosition(0, 6), topHost),
            new ChessN(new ChessPosition(0, 7), topHost),
            new ChessR(new ChessPosition(0, 8), topHost),

            new ChessC(new ChessPosition(2, 1), topHost),
            new ChessC(new ChessPosition(2, 7), topHost),

            new ChessS(new ChessPosition(3, 0), topHost),
            new ChessS(new ChessPosition(3, 2), topHost),
            new ChessS(new ChessPosition(3, 4), topHost),
            new ChessS(new ChessPosition(3, 6), topHost),
            new ChessS(new ChessPosition(3, 8), topHost),

            // 底部方
            new ChessR(new ChessPosition(9, 0), bottomHost),
            new ChessN(new ChessPosition(9, 1), bottomHost),
            new ChessM(new ChessPosition(9, 2), bottomHost),
            new ChessG(new ChessPosition(9, 3), bottomHost),
            new ChessK(new ChessPosition(9, 4), bottomHost),
            new ChessG(new ChessPosition(9, 5), bottomHost),
            new ChessM(new ChessPosition(9, 6), bottomHost),
            new ChessN(new ChessPosition(9, 7), bottomHost),
            new ChessR(new ChessPosition(9, 8), bottomHost),

            new ChessC(new ChessPosition(7, 1), bottomHost),
            new ChessC(new ChessPosition(7, 7), bottomHost),

            new ChessS(new ChessPosition(6, 0), bottomHost),
            new ChessS(new ChessPosition(6, 2), bottomHost),
            new ChessS(new ChessPosition(6, 4), bottomHost),
            new ChessS(new ChessPosition(6, 6), bottomHost),
            new ChessS(new ChessPosition(6, 8), bottomHost),
        }).forEach(chess -> {
            chessboard.getChildren().addAll(new DrawableChess(chess));
        });
    }

    public void startRound() {
        resetChessLayout();

    }

    private void resetChessLayout() {

    }
}
