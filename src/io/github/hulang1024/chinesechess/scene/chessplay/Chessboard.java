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
    // 交叉点之间的距离
    public static final int GAP = DrawableChess.SIZE + 8;
    // 外边框位置
    public static final int BORDER_LEFT = 32;
    public static final int BORDER_TOP = 32;
    public static final int BORDER_LINE_WIDTH = 2;
    // 网格距离边框边距
    public static final int GRID_MARGIN = 8;
    // 网格尺寸
    public static final int GRID_WIDTH = GAP * (COL_NUM - 1);
    public static final int GRID_HEIGHT = GAP * (ROW_NUM / 2 - 1);
    public static final int GRID_X = BORDER_LEFT + GRID_MARGIN;
    public static final int GRID_Y = BORDER_TOP + GRID_MARGIN;
    
    private AbstractChess[][] chessArray = new AbstractChess[ROW_NUM][COL_NUM];

    public Chessboard() {
        Canvas canvas = new Canvas(
            BORDER_LEFT + GRID_WIDTH + GRID_MARGIN * 2 + BORDER_LINE_WIDTH,
            BORDER_TOP + GRID_HEIGHT * 2 + GAP + GRID_MARGIN * 2 + BORDER_LINE_WIDTH);
        GraphicsContext ctx = canvas.getGraphicsContext2D();
        // 画外边框
        ctx.setLineWidth(BORDER_LINE_WIDTH);
        ctx.strokeRect(BORDER_LEFT, BORDER_TOP,
            GRID_WIDTH + GRID_MARGIN * 2, GRID_HEIGHT * 2 + GAP + GRID_MARGIN * 2);

        /// 画内部棋格
        ctx.setLineWidth(1);
        ctx.strokeRect(GRID_X, GRID_Y,GRID_WIDTH, GRID_HEIGHT * 2 + GAP);
        for (int p = 0; p < 2; p++) {
            // 画横线
            for (int row = 0; row < ROW_NUM / 2; row++) {
                int y = p * GRID_HEIGHT + GRID_Y + row * GAP;
                ctx.strokeLine(GRID_X, y, GRID_X + GRID_WIDTH, y);
            }
            // 画竖线
            for (int col = 0; col < COL_NUM; col++) {
                int x = GRID_X + col * GAP;
                int baseY = p * GRID_HEIGHT + p * GAP;
                ctx.strokeLine(x, baseY + GRID_Y, x, baseY + GRID_Y + GRID_HEIGHT);
            }
            // 画中间九宫的斜线
            int x1 = GRID_X + 3 * GAP;
            int x2 = GRID_X + 5 * GAP;
            int baseY = p * GRID_HEIGHT + p * 3 * GAP;
            ctx.strokeLine(x1, baseY + GRID_Y, x2, baseY + GRID_Y + 2 * GAP);
            ctx.strokeLine(x1, baseY + GRID_Y + 2 * GAP, x2, baseY + GRID_Y);
        }
        // 画河界
        ctx.setFont(Font.font(GAP * 0.4));
        ctx.setFill(Color.GRAY);
        double textY = GRID_Y + GAP * 4.5 + ctx.getFont().getSize() / 3;
        ctx.fillText("楚河", GRID_X + GAP * 2, textY);
        ctx.fillText("汉界", GRID_X + GAP * 5.2, textY);

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
