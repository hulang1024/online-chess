package io.github.hulang1024.chinesechess.scene.chessplay;

import io.github.hulang1024.chinesechess.scene.chessplay.rule.Chess;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.ChessPosition;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.HostEnum;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.RoundGame;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.chess.*;
import javafx.scene.effect.BlurType;
import javafx.scene.effect.DropShadow;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.text.Font;
import javafx.scene.text.Text;


/**
 * @author Hu Lang
 */
public class DrawableChess extends Pane implements Chess {
    public static final int SIZE = 50;
    private Chess chess;
    private boolean selected = false;
    private Circle circle;
    private Text text;

    private static final Color CIRCLE_FILL_COLOR = Color.valueOf("#f2c27d");

    public DrawableChess(Chess chess) {
        this.chess = chess;

        setMaxSize(SIZE, SIZE);
        setMinSize(SIZE, SIZE);

        circle = new Circle(SIZE / 2f, chess instanceof ChessGhost ? null : CIRCLE_FILL_COLOR);

        DropShadow shadow = new DropShadow();
        shadow.setBlurType(BlurType.GAUSSIAN);
        shadow.setColor(Color.color(0.1, 0.1, 0.1, 0.2));
        shadow.setHeight(SIZE / 2f);
        shadow.setWidth(SIZE / 2f);
        shadow.setRadius(SIZE / 2f);
        circle.setEffect(shadow);
        getChildren().add(circle);

        text = new Text(-14, 10, getNameText());
        text.setFont(Font.font(SIZE / 1.8f));
        text.setFill(getFillColor());
        getChildren().add(text);

        setOnMouseEntered(event -> {
            if (selected) return;
            if (chess instanceof ChessGhost) {
                circle.setFill(CIRCLE_FILL_COLOR);
                setOpacity(0.2);
            } else {
                setOpacity(0.6);
            }
        });
        setOnMouseExited(event -> {
            if (selected) return;
            if (chess instanceof ChessGhost) {
                circle.setFill(null);
                setOpacity(1.0);
            } else {
                setOpacity(1.0);
            }
        });
    }

    public boolean isSelected() {
        return selected;
    }

    public void setSelected(boolean selected) {
        this.selected = selected;

        if (chess instanceof ChessGhost) {
            if (selected) {
                circle.setFill(CIRCLE_FILL_COLOR);
                setOpacity(0.2);
            } else {
                circle.setFill(null);
                setOpacity(1.0);
            }
        } else {
            if (selected) {
                setOpacity(0.6);
            } else {
                setOpacity(1.0);
            }
        }
    }

    private Color getFillColor() {
        return chess.host() == HostEnum.RED ? Color.RED : Color.BLACK;
    }

    public String getNameText() {
        if (chess instanceof ChessS) {
            return chess.host() == HostEnum.RED ? "兵" : "卒";
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
            return chess.host() == HostEnum.RED ? "相" : "象";
        }
        if (chess instanceof ChessG) {
            return chess.host() == HostEnum.RED ? "仕" : "士";
        }
        if (chess instanceof ChessK) {
            return chess.host() == HostEnum.RED ? "帥" : "將";
        }
        return null;
    }

    public Chess getChess() {
        return chess;
    }

    @Override
    public void setPos(ChessPosition pos) {
        chess.setPos(pos);
    }

    @Override
    public void setHost(HostEnum host) {
        chess.setHost(host);
    }

    @Override
    public ChessPosition pos() {
        return chess.pos();
    }

    @Override
    public HostEnum host() {
        return chess.host();
    }

    @Override
    public boolean canGoTo(ChessPosition destPos, RoundGame game) {
        return chess.canGoTo(destPos, game);
    }
}
