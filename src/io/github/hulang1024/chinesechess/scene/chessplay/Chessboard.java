package io.github.hulang1024.chinesechess.scene.chessplay;

import io.github.hulang1024.chinesechess.scene.chessplay.rule.ChessPosition;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.chess.AbstractChess;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.layout.StackPane;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;

/**
 * 棋盘
 * @author Hu Lang
 */
public class Chessboard extends StackPane {
    public static final int ROW_NUM = 10;
    public static final int COL_NUM = 9;
    int WIDTH = 800;
    int HEIGHT = 600;
    private AbstractChess[][] chessArray = new AbstractChess[ROW_NUM][COL_NUM];

    public Chessboard() {
        Canvas canvas = new Canvas(WIDTH, HEIGHT);
        GraphicsContext ctx = canvas.getGraphicsContext2D();

        //ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.strokeRect(8, 8, WIDTH - 32, HEIGHT - 56);
        getChildren().add(canvas);
    }

    /**
     * 指定位置是否为空位
     * @param row
     * @param col
     * @return
     */
    public boolean isEmpty(int row, int col) {
        return chessAt(row, col) == null;
    }

    /**
     * 获取指定位置上棋子
     * @param pos
     * @return
     */
    public AbstractChess chessAt(ChessPosition pos) {
        return chessAt(pos.row, pos.col);
    }

    /**
     * 获取指定位置上棋子
     * @param row
     * @param col
     * @return
     */
    public AbstractChess chessAt(int row, int col) {
        return chessArray[row][col];
    }
}
