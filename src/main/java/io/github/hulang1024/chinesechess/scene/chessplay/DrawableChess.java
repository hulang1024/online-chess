package io.github.hulang1024.chinesechess.scene.chessplay;

import io.github.hulang1024.chinesechess.scene.chessplay.rule.HostEnum;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.chess.*;
import javafx.scene.control.Control;
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
public class DrawableChess extends Pane {
    public static final int SIZE = 50;
    public AbstractChess chess;

    private boolean selected = false;
    private Circle circle;
    private Text text;

    private static final Color CIRCLE_FILL_COLOR = Color.valueOf("#f2c27d");

    public DrawableChess(AbstractChess chess) {
        this.chess = chess;

        setMinSize(SIZE, SIZE);
        setPrefSize(Control.USE_PREF_SIZE , Control.USE_PREF_SIZE);

        circle = new Circle(SIZE / 2f, chess instanceof ChessGhost ? null : CIRCLE_FILL_COLOR);
        DropShadow shadow = new DropShadow();
        shadow.setBlurType(BlurType.GAUSSIAN);
        shadow.setColor(Color.color(0.1, 0.1, 0.1, 0.2));
        shadow.setHeight(SIZE / 2f);
        shadow.setWidth(SIZE / 2f);
        shadow.setRadius(SIZE / 2f);
        circle.setEffect(shadow);
        getChildren().add(circle);

        //TODO:文字居中
        text = new Text(-14, 10, getNameText());
        text.setFont(Font.font(SIZE / 1.8f));
        text.setFill(getFillColor());
        getChildren().add(text);

        setOnMouseEntered(event -> {
            if (selected || chess instanceof ChessGhost) {
                return;
            }
            setOpacity(0.6);
        });
        setOnMouseExited(event -> {
            if (selected || chess instanceof ChessGhost) {
                return;
            }
            setOpacity(1.0);
        });
    }

    public boolean isSelected() {
        return selected;
    }

    public void setSelected(boolean selected) {
        if (chess instanceof ChessGhost) {
            return;
        }
        this.selected = selected;
        if (selected) {
            setOpacity(0.6);
        } else {
            setOpacity(1.0);
        }
    }

    private Color getFillColor() {
        return chess.host == HostEnum.RED ? Color.RED : Color.BLACK;
    }

    public String getNameText() {
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
