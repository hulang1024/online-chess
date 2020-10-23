package io.github.hulang1024.chinesechess.scene.chessplay;

import io.github.hulang1024.chinesechess.scene.chessplay.rule.Chess;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.ChessPosition;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.Chessboard;
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
    /** 交叉点之间的距离 */
    private static final int GAP = DrawableChess.SIZE + 4;
    /** 棋盘画板外边距 */
    private static final int CANVAS_MARGIN = 32;
    /** 外边框 */
    private static final int BORDER_LINE_WIDTH = 2;
    private static final int BORDER_LEFT = BORDER_LINE_WIDTH;
    private static final int BORDER_TOP = BORDER_LINE_WIDTH;
    /** 网格距离外边框的边距 */
    private static final int GRID_MARGIN = 20;
    /** 网格尺寸和位置 */
    private static final int GRID_WIDTH = GAP * (COL_NUM - 1);
    private static final int GRID_HEIGHT = GAP * (ROW_NUM / 2 - 1);
    private static final int GRID_X = BORDER_LEFT + GRID_MARGIN;
    private static final int GRID_Y = BORDER_TOP + GRID_MARGIN;
    /** 棋子状态矩阵 */
    private Chess[][] chessArray = new Chess[ROW_NUM][COL_NUM];

    public DrawableChessboard() {
        // 设置背景
        setBackground(new Background(new BackgroundFill(Color.rgb(250, 250, 250), null ,null)));

        // 创建画板
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

        /// 画棋盘网格
        // 画网格矩形
        ctx.setLineWidth(2);
        ctx.strokeRect(GRID_X, GRID_Y,GRID_WIDTH, GRID_HEIGHT * 2 + GAP);
        // 画内部格子
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

        // 挂画板
        setCenter(canvas);
    }

    /**
     * 设置棋子位置
     * @param drawableChess
     * @param pos
     */
    private void setChessPositionInChessboard(DrawableChess drawableChess, ChessPosition pos) {
        drawableChess.setTranslateX(CANVAS_MARGIN + GRID_X + pos.col * GAP);
        drawableChess.setTranslateY(CANVAS_MARGIN + GRID_Y + pos.row * GAP);
    }

    @Override
    public void addChess(Chess chess) {
        setChessPositionInChessboard((DrawableChess)chess, chess.pos());
        getChildren().add((DrawableChess)chess);
        chessArray[chess.pos().row][chess.pos().col] = chess;
    }

    @Override
    public void removeChess(Chess chess) {
        getChildren().remove(chess);
        chessArray[chess.pos().row][chess.pos().col] = null;
    }


    @Override
    public void moveChess(Chess chess, ChessPosition destPos) {
        assert chessArray[chess.pos().row][chess.pos().col] == null;
        chessArray[destPos.row][destPos.col] = chess;
        chess.setPos(destPos);
        setChessPositionInChessboard((DrawableChess)chess, destPos);
    }


    @Override
    public List<Chess> getChessList() {
        List<Chess> list = new ArrayList<>();
        for (int row = 0; row < Chessboard.ROW_NUM; row++) {
            for (int col = 0; col < Chessboard.COL_NUM; col++) {
                list.add(chessArray[row][col]);
            }
        }
        return list;
    }

    @Override
    public void clear() {
        getChildren().removeIf(node -> node instanceof DrawableChess);
    }

    @Override
    public boolean isEmpty(int row, int col) {
        return chessAt(row, col) == null || ((DrawableChess)chessAt(row, col)).getChess() instanceof ChessGhost;
    }

    @Override
    public Chess chessAt(int row, int col) {
        return chessArray[row][col];
    }
}
