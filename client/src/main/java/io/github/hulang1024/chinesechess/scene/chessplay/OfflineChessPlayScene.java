package io.github.hulang1024.chinesechess.scene.chessplay;

import io.github.hulang1024.chinesechess.scene.AbstractScene;
import io.github.hulang1024.chinesechess.scene.SceneContext;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.*;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.chess.*;
import javafx.scene.control.Button;

import java.util.Arrays;
import java.util.function.BiConsumer;

/**
 * 游戏下棋主场景
 * @author Hu Lang
 */
public class OfflineChessPlayScene extends AbstractScene implements RoundGame {
    private DrawableChessboard chessboard = new DrawableChessboard(this);
    private HostEnum activeHost;
    private DrawableChess lastSelected;

    public OfflineChessPlayScene(SceneContext context) {
        super(context);

        getChildren().add(chessboard);

        Button backButton = new Button("离开");
        backButton.setOnMouseClicked((event) -> {
            popScene();
        });
        getChildren().add(backButton);

        startRound();
    }

    public void startRound() {
        resetChessLayout();
        activeHost = HostEnum.BLACK;
        turnHost();
    }

    private void resetChessLayout() {
        BiConsumer<HostEnum, int[]> addChessGroup = (host, rows) -> {
            Arrays.stream(new Chess[]{
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
        // 加空棋
        for (int row = 0; row < Chessboard.ROW_NUM; row++) {
            for (int col = 0; col < Chessboard.COL_NUM; col++) {
                if (chessboard.isEmpty(row, col)) {
                    DrawableChess ghostChess = new DrawableChess(
                        new ChessGhost(new ChessPosition(row, col)));
                    setChessEventHandlers(ghostChess);
                    chessboard.addChess(ghostChess);
                }
            }
        }
    }

    private void turnHost() {
        activeHost = activeHost.reverse();

        System.out.println("现在 " + (activeHost == HostEnum.BLACK ? "黑方" : "红方") + " 持棋");

        // 将当前持棋方棋子启用，非持棋方的棋子全部禁用
        chessboard.getChessList().forEach(chess -> {
            if (((DrawableChess)chess).getChess() instanceof ChessGhost) {
                return;
            }
            ((DrawableChess)chess).setDisable(chess.host() != activeHost);
        });
    }

    private void onGoTo(DrawableChess selected, DrawableChess target) {
        // 目标位置上是否有棋子
        if (target.getChess() instanceof ChessGhost) {
            // 目标位置无棋子
            // 判断目标位置是否可走
            if (selected.canGoTo(target.pos(), this)) {
                // 目标位置可走
                ChessPosition sourcePos = selected.pos().copy();
                chessboard.removeChess(target);
                chessboard.moveChess(selected, target.pos());
                target.setPos(sourcePos);
                chessboard.addChess(target);
                turnHost();
            } else {
                System.out.println("走法不符规则");
            }
        } else {
            if (target.host() != selected.host()) {
                // 目标位置上有敌方棋子
                if (selected.canGoTo(target.pos(), this)) {
                    // 目标位置棋子可吃
                    ChessPosition sourcePos = selected.pos().copy();
                    chessboard.removeChess(target);
                    chessboard.moveChess(selected, target.pos());
                    DrawableChess ghostChess = new DrawableChess(new ChessGhost(sourcePos));
                    setChessEventHandlers(ghostChess);
                    chessboard.addChess(ghostChess);
                    turnHost();
                } else {
                    System.out.println("走法不符规则");
                }
            } else {
                // 目标位置上有本方棋子
                System.out.println("走法不符规则");
            }
        }
        selected.setSelected(false);
        this.lastSelected = null;
    }

    private void setChessEventHandlers(DrawableChess eventDrawableChess) {
        if (eventDrawableChess.getChess() instanceof ChessGhost) {
            eventDrawableChess.setOnMouseClicked(event -> {
                if (lastSelected != null) {
                    onGoTo(lastSelected, eventDrawableChess);
                }
            });
            return;
        }
        eventDrawableChess.setOnMouseClicked(event -> {
            if (lastSelected == null) {
                // 如果当前没有任何棋子选中，现在是选择要走的棋子，只能先选中持棋方棋子
                if (eventDrawableChess.host() != activeHost) {
                    return;
                }
                eventDrawableChess.setSelected(true);
                lastSelected = eventDrawableChess;

                // 将非持棋方的棋子全部启用（这样才能点击要吃的目标棋子）
                chessboard.getChessList().forEach(chess -> {
                    if (((DrawableChess)chess).getChess() instanceof ChessGhost) {
                        return;
                    }
                    if (chess.host() != activeHost) {
                        ((DrawableChess)chess).setDisable(false);
                    }
                });
            } else if (eventDrawableChess.isSelected() && eventDrawableChess.host() == activeHost) {
                // 重复点击，取消选中
                eventDrawableChess.setSelected(false);
                lastSelected = null;
            } else {
                // 当选择了两个棋子（包括了空棋子），并且两个棋子属于不同棋方，可能要移动或者吃子
                if (eventDrawableChess.host() != lastSelected.host()) {
                    onGoTo(lastSelected, eventDrawableChess);
                } else {
                    chessboard.getChessList().forEach(chess -> {
                        if (((DrawableChess)chess).isSelected()) {
                            ((DrawableChess)chess).setSelected(false);
                        }
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
