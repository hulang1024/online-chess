package io.github.hulang1024.chinesechess.scene.chessplay;

import io.github.hulang1024.chinesechess.scene.chessplay.rule.*;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.chess.*;
import javafx.scene.layout.FlowPane;
import javafx.scene.paint.Color;
import javafx.scene.text.Text;

import java.util.Arrays;
import java.util.function.BiConsumer;

/**
 * 游戏下棋主场景
 * @author Hu Lang
 */
public class ChessPlayScene extends FlowPane implements RoundGame {
    private DrawableChessboard chessboard = new DrawableChessboard();
    private HostEnum activeHost;
    private DrawableChess lastSelected;
    private Text ruleMessageText;

    public ChessPlayScene() {
        getChildren().add(chessboard);

        ruleMessageText = new Text("无提示");
        ruleMessageText.setFill(Color.BLACK);
        getChildren().add(ruleMessageText);

        startRound();
    }

    public void startRound() {
        resetChessLayout();
        activeHost = HostEnum.BLACK;
        turnHost();
    }

    private void resetChessLayout() {
        BiConsumer<HostEnum, int[]> addChessGroup = (host, rows) -> {
            Arrays.stream(new AbstractChess[]{
                new ChessR(new ChessPosition(rows[0], 0), host),
                new ChessN(new ChessPosition(rows[0], 1), host),
                new ChessM(new ChessPosition(rows[0], 2), host),
                new ChessG(new ChessPosition(rows[0], 3), host),
                new ChessK(new ChessPosition(rows[0], 4), host),
                new ChessG(new ChessPosition(rows[0], 5), host),
                new ChessM(new ChessPosition(rows[0], 6), host),
                new ChessN(new ChessPosition(rows[0], 7), host),
                new ChessR(new ChessPosition(rows[0], 8), host),
                new ChessC(new ChessPosition(rows[1], 1), host),
                new ChessC(new ChessPosition(rows[1], 7), host),
                new ChessS(new ChessPosition(rows[2], 0), host),
                new ChessS(new ChessPosition(rows[2], 2), host),
                new ChessS(new ChessPosition(rows[2], 4), host),
                new ChessS(new ChessPosition(rows[2], 6), host),
                new ChessS(new ChessPosition(rows[2], 8), host)
            }).forEach(chess -> {
                DrawableChess drawableChess = new DrawableChess(chess);
                setChessEventHandlers(drawableChess);
                chessboard.addChess(drawableChess);
            });
        };

        chessboard.clear();
        // 顶部方
        addChessGroup.accept(HostEnum.BLACK, new int[]{0, 2, 3});
        // 底部方
        addChessGroup.accept(HostEnum.RED, new int[]{9, 7, 6});

        for (int row = 0; row < Chessboard.ROW_NUM; row++) {
            for (int col = 0; col < Chessboard.COL_NUM; col++) {
                if (chessboard.isEmpty(row, col)) {
                    DrawableChess ghostChess = new DrawableChess(
                        new ChessGhost(new ChessPosition(row, col), null));
                    ghostChess.setOnMouseClicked(event -> {
                        if (lastSelected != null) {
                            onGoTo(lastSelected, ghostChess);
                        }
                    });
                    chessboard.addChess(ghostChess);
                }
            }
        }
    }

    private void turnHost() {
        activeHost = activeHost == HostEnum.BLACK ? HostEnum.RED : HostEnum.BLACK;
        ruleMessageText.setFill(Color.BLACK);
        // 将当前持棋方棋子启用，非持棋方的棋子全部禁用
        chessboard.getDrawableChesses().forEach(drawableChess -> {
            if (drawableChess.chess instanceof ChessGhost) {
                return;
            }
            drawableChess.setDisable(drawableChess.chess.host != activeHost);
        });
        ruleMessageText.setText("现在 " + (activeHost == HostEnum.BLACK ? "黑方" : "红方") + " 持棋");
    }

    private void onGoTo(DrawableChess selected, DrawableChess target) {
        // 目标位置上是否有棋子
        if (target.chess instanceof ChessGhost) {
            // 目标位置无棋子
            // 判断目标位置是否可走
            if (selected.chess.canGoTo(target.chess.pos, this)) {
                // 目标位置可走
                chessboard.moveChess(selected, target.chess.pos);
                chessboard.moveChess(target, selected.chess.pos);
                ChessPosition pos = target.chess.pos;
                target.chess.pos = selected.chess.pos;
                selected.chess.pos = pos;
                turnHost();
            } else {
                ruleMessageText.setFill(Color.RED);
                ruleMessageText.setText("走法不符规则");
            }
        } else {
            if (target.chess.host != selected.chess.host) {
                // 目标位置上有敌方棋子
                if (selected.chess.canGoTo(target.chess.pos, this)) {
                    // 目标位置棋子可吃
                    chessboard.removeChess(target);
                    chessboard.moveChess(selected, target.chess.pos);
                    chessboard.addChess(new DrawableChess(new ChessGhost(selected.chess.pos.copy(), null)));
                    turnHost();
                } else {
                    ruleMessageText.setFill(Color.RED);
                    ruleMessageText.setText("走法不符规则");
                }
            } else {
                // 目标位置上有本方棋子
                ruleMessageText.setFill(Color.RED);
                ruleMessageText.setText("走法不符规则");
            }
        }
        selected.setSelected(false);
        this.lastSelected = null;
    }

    private void setChessEventHandlers(DrawableChess eventDrawableChess) {
        eventDrawableChess.setOnMouseClicked(event -> {
            if (lastSelected == null) {
                // 如果当前没有任何棋子选中，现在是选择要走的棋子，只能先选中持棋方棋子
                if (eventDrawableChess.chess.host != activeHost) {
                    return;
                }
                eventDrawableChess.setSelected(true);
                lastSelected = eventDrawableChess;

                // 将非持棋方的棋子全部启用（这样才能点击要吃的目标棋子）
                chessboard.getDrawableChesses().forEach(drawableChess -> {
                    if (drawableChess.chess instanceof ChessGhost) {
                        return;
                    }
                    if (drawableChess.chess.host != activeHost) {
                        drawableChess.setDisable(false);
                    }
                });
            } else if (eventDrawableChess.isSelected()) {
                // 重复点击，取消选中
                eventDrawableChess.setSelected(false);
                lastSelected = null;
            } else {
                // 当选择了两个棋子（包括了空棋子），并且两个棋子属于不同棋方，可能要移动或者吃子
                if (eventDrawableChess.chess.host != lastSelected.chess.host) {
                    onGoTo(lastSelected, eventDrawableChess);
                } else {
                    chessboard.getDrawableChesses().forEach(chess -> {
                        chess.setSelected(false);
                    });
                    eventDrawableChess.setSelected(true);
                    lastSelected = eventDrawableChess;
                }
            }
        });
    }

    @Override
    public DrawableChessboard getChessboard() {
        return chessboard;
    }

    @Override
    public boolean isHostAtChessboardTop(HostEnum host) {
        //TODO: 暂定黑方在顶部（最顶部纵坐标是0），后面支持变化
        return host == HostEnum.BLACK;
    }
}
