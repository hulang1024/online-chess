package io.github.hulang1024.chinesechess.scene.home.menu;

import javafx.scene.layout.VBox;

/**
 * @author Hu Lang
 */
public class MainMenu extends VBox {

    public MainMenu(MenuMainEventHandler eventHandler) {
        MenuButton p2Button = new MenuButton("本地2人");
        p2Button.setOnMouseClicked(event -> {
            eventHandler.onP2();
        });

        MenuButton onlineButton = new MenuButton("游戏大厅");
        onlineButton.setOnMouseClicked(event -> {
            eventHandler.onOnline();
        });

        MenuButton exitButton = new MenuButton("退出");
        exitButton.setMinWidth(200);
        exitButton.setOnMouseClicked(event -> {
            eventHandler.onExit();
        });

        getChildren().addAll(onlineButton, p2Button, exitButton);
    }
}
