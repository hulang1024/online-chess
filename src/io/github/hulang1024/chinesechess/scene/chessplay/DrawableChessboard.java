package io.github.hulang1024.chinesechess.scene.chessplay;

import io.github.hulang1024.chinesechess.scene.chessplay.rule.ChessPosition;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.Chessboard;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.chess.AbstractChess;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.chess.ChessGhost;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;

import java.util.List;
import java.util.ArrayList;

/**
 * 棋盘
 * @author Hu Lang
 */
public class DrawableChessboard extends Pane implements Chessboard {
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

    private List<DrawableChess> drawableChesses = new ArrayList<>();

    public DrawableChessboard() {
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
     * 清空棋盘棋子
     */
    public void clear() {
        getChildren().removeIf(node -> node instanceof DrawableChess);
    }

    /**
     * 加一个棋子
     * @param drawableChess
     */
    public void addChess(DrawableChess drawableChess) {
        drawableChess.setTranslateX(GRID_X + drawableChess.chess.pos.col * GAP);
        drawableChess.setTranslateY(GRID_Y + drawableChess.chess.pos.row * GAP);
        getChildren().add(drawableChess);
        AbstractChess chess = drawableChess.chess;
        chessArray[chess.pos.row][chess.pos.col] = chess;
        drawableChesses.add(drawableChess);
    }

    /**
     * 移除棋子
     * @param drawableChess
     */
    public void removeChess(DrawableChess drawableChess) {
        AbstractChess chess = drawableChess.chess;
        getChildren().remove(drawableChess);
        chessArray[chess.pos.row][chess.pos.col] = null;
        drawableChesses.remove(chess);
    }

    /**
     * 移动棋子
     * @param drawableChess
     * @param destPos
     */
    public void moveChess(DrawableChess drawableChess, ChessPosition destPos) {
        chessArray[destPos.row][destPos.col] = drawableChess.chess;
        drawableChess.setTranslateX(GRID_X + destPos.col * GAP);
        drawableChess.setTranslateY(GRID_Y + destPos.row * GAP);
    }

    /**
     * 所有棋子
     * @return
     */
    public List<DrawableChess> getDrawableChesses() {
        return drawableChesses;
    }

    @Override
    public boolean isEmpty(int row, int col) {
        return chessAt(row, col) == null || chessAt(row, col) instanceof ChessGhost;
    }

    @Override
    public AbstractChess chessAt(ChessPosition pos) {
        return chessAt(pos.row, pos.col);
    }

    @Override
    public AbstractChess chessAt(int row, int col) {
        return chessArray[row][col];
    }
}
