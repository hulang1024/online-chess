package io.github.hulang1024.chinesechess.scene.chessplay;

import io.github.hulang1024.chinesechess.scene.chessplay.rule.ChessPosition;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.Chessboard;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.chess.AbstractChess;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.chess.ChessGhost;
import javafx.geometry.Insets;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.layout.Background;
import javafx.scene.layout.BackgroundFill;
import javafx.scene.layout.BorderPane;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;

import java.util.List;
import java.util.ArrayList;

/**
 * 棋盘
 * @author Hu Lang
 */
public class DrawableChessboard extends BorderPane implements Chessboard {
    // 交叉点之间的距离
    public static final int GAP = DrawableChess.SIZE + 4;
    // 棋盘画板外边距
    public static final int CANVAS_MARGIN = 32;
    // 外边框
    public static final int BORDER_LINE_WIDTH = 2;
    public static final int BORDER_LEFT = BORDER_LINE_WIDTH;
    public static final int BORDER_TOP = BORDER_LINE_WIDTH;
    // 网格距离边框边距
    public static final int GRID_MARGIN = 20;
    // 网格尺寸
    public static final int GRID_WIDTH = GAP * (COL_NUM - 1);
    public static final int GRID_HEIGHT = GAP * (ROW_NUM / 2 - 1);
    public static final int GRID_X = BORDER_LEFT + GRID_MARGIN;
    public static final int GRID_Y = BORDER_TOP + GRID_MARGIN;
    
    private AbstractChess[][] chessArray = new AbstractChess[ROW_NUM][COL_NUM];

    private List<DrawableChess> drawableChesses = new ArrayList<>();

    public DrawableChessboard() {
        setBackground(new Background(new BackgroundFill(Color.rgb(250, 250, 250), null ,null)));

        Canvas canvas = new Canvas(
            BORDER_LEFT + GRID_WIDTH + GRID_MARGIN * 2 + BORDER_LINE_WIDTH * 2,
            BORDER_TOP + GRID_HEIGHT * 2 + GAP + GRID_MARGIN * 2 + BORDER_LINE_WIDTH * 2);
        setMargin(canvas, new Insets(CANVAS_MARGIN, CANVAS_MARGIN, CANVAS_MARGIN, CANVAS_MARGIN));

        GraphicsContext ctx = canvas.getGraphicsContext2D();

        ctx.setStroke(Color.GRAY);
        // 画外边框
        ctx.setLineWidth(1);
        ctx.strokeRect(BORDER_LEFT, BORDER_TOP,
            GRID_WIDTH + GRID_MARGIN * 2, GRID_HEIGHT * 2 + GAP + GRID_MARGIN * 2);

        /// 画内部棋格
        ctx.setLineWidth(2);
        ctx.strokeRect(GRID_X, GRID_Y,GRID_WIDTH, GRID_HEIGHT * 2 + GAP);
        ctx.setLineWidth(1);
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
        ctx.setFont(Font.font(GAP * 0.6));
        ctx.setFill(Color.gray(0.1, 0.2));
        double textY = GRID_Y + GAP * 4.5 + ctx.getFont().getSize() / 3;
        ctx.fillText("楚 河", GRID_X + GAP * 1.1, textY);
        ctx.fillText("汉 界", GRID_X + GAP * 5.6, textY);
        setCenter(canvas);
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
        AbstractChess chess = drawableChess.chess;
        setChessPositionInChessboard(drawableChess, chess.pos);
        getChildren().add(drawableChess);
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
        setChessPositionInChessboard(drawableChess, destPos);
    }

    /**
     * 所有棋子
     * @return
     */
    public List<DrawableChess> getDrawableChesses() {
        return drawableChesses;
    }

    private void setChessPositionInChessboard(DrawableChess drawableChess, ChessPosition pos) {
        drawableChess.setTranslateX(CANVAS_MARGIN + GRID_X + pos.col * GAP);
        drawableChess.setTranslateY(CANVAS_MARGIN + GRID_Y + pos.row * GAP);
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
