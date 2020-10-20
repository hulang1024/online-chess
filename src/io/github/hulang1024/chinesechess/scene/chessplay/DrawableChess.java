package io.github.hulang1024.chinesechess.scene.chessplay;

import io.github.hulang1024.chinesechess.scene.chessplay.rule.HostEnum;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.chess.*;
import javafx.scene.layout.BorderPane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.text.Font;
import javafx.scene.text.Text;
import sun.awt.SunHints;

/**
 * @author Hu Lang
 */
public class DrawableChess extends BorderPane {
    public static final int SIZE = 50;
    public AbstractChess chess;

    public DrawableChess(AbstractChess chess) {
        Circle circle = new Circle(SIZE / 2f, Color.WHEAT);
        getChildren().add(circle);
        //TODO:文字居中
        Text text = new Text(-10, 6, getText(chess));
        text.setFont(Font.font(SIZE / 2.6f));
        text.setFill(chess.host == HostEnum.RED ? Color.RED : Color.BLACK);
        getChildren().add(text);
        setTranslateX(Chessboard.GRID_X + chess.pos.col * Chessboard.GAP);
        setTranslateY(Chessboard.GRID_Y + chess.pos.row * Chessboard.GAP);
    }

    private static String getText(AbstractChess chess) {
        if (chess instanceof ChessS) {
            return chess.host == HostEnum.RED ? "兵" : "卒";
        }
        if (chess instanceof ChessC) {
            return "炮";
        }
        if (chess instanceof ChessR) {
            return "車";
        }
        if (chess instanceof ChessN) {
            return "馬";
        }
        if (chess instanceof ChessM) {
            return chess.host == HostEnum.RED ? "相" : "象";
        }
        if (chess instanceof ChessG) {
            return chess.host == HostEnum.RED ? "仕" : "士";
        }
        if (chess instanceof ChessK) {
            return chess.host == HostEnum.RED ? "帥" : "將";
        }
        return null;
    }
}
