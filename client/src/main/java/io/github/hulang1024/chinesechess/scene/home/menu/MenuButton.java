package io.github.hulang1024.chinesechess.scene.home.menu;

import javafx.scene.control.Button;
import javafx.scene.text.Font;

class MenuButton extends Button {
    public MenuButton(String text) {
        super(text);
        setMinSize(240, 50);
        setFont(Font.font(20));
    }
}
