package io.github.hulang1024.chinesechess.scene.chessplay;

import javafx.scene.control.Button;
import javafx.scene.layout.Background;
import javafx.scene.layout.BackgroundFill;
import javafx.scene.paint.Color;

public class ReadyButton extends Button {
    private boolean readyed;

    public ReadyButton(boolean readyed) {
        this.readyed = readyed;
        update();
    }

    public void toggleReady() {
        this.readyed = !this.readyed;
        update();
    }

    private void update() {
        setBackground(new Background(new BackgroundFill(readyed ? Color.RED : Color.GREENYELLOW, null, null)));
        setText(readyed ? "不准备" : "准备");
    }
}
