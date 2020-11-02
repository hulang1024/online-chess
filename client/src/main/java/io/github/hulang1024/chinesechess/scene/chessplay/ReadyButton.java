package io.github.hulang1024.chinesechess.scene.chessplay;

import javafx.scene.control.Button;
import javafx.scene.paint.Color;

public class ReadyButton extends Button {
    private boolean readyed;

    public ReadyButton(boolean readyed) {
        setMinWidth(80);
        setMinHeight(30);
        this.readyed = readyed;
        update();
    }

    public void toggleReady() {
        this.readyed = !this.readyed;
        update();
    }

    private void update() {
        setTextFill(readyed ? Color.RED : Color.GREENYELLOW);
        setText(readyed ? "取消准备" : "准备");
    }
}
