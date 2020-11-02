package io.github.hulang1024.chinesechess.scene.home.menu;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.layout.VBox;

/**
 * @author Hu Lang
 */
public class MainMenu extends VBox {

    public MainMenu(MenuMainEventHandler eventHandler) {
        setAlignment(Pos.CENTER);
        MenuButton p2Button = new MenuButton("本地2人");
        setMargin(p2Button, new Insets(0, 0, 16, 0));
        p2Button.setOnMouseClicked(event -> {
            eventHandler.onP2();
        });

        MenuButton onlineButton = new MenuButton("游戏大厅");
        setMargin(onlineButton, new Insets(0, 0, 16, 0));
        onlineButton.setOnMouseClicked(event -> {
            eventHandler.onOnline();
        });

        MenuButton exitButton = new MenuButton("退出");
        exitButton.setOnMouseClicked(event -> {
            eventHandler.onExit();
        });

        getChildren().addAll(onlineButton, p2Button, exitButton);
    }
}
