package io.github.hulang1024.chinesechess.scene.home.menu;

import javafx.scene.control.Button;
import javafx.scene.layout.VBox;

/**
 * @author Hu Lang
 */
public class MainMenu extends VBox {
    private MenuMainEventHandler eventHandler;

    public MainMenu(MenuMainEventHandler eventHandler) {
        this.eventHandler = eventHandler;

        Button p2Button = new Button("本地2人");
        p2Button.setMinWidth(200);
        p2Button.setOnMouseClicked(event -> {
            eventHandler.onP2();
        });

        Button exitButton = new Button("退出");
        exitButton.setMinWidth(200);
        exitButton.setOnMouseClicked(event -> {
            eventHandler.onExit();
        });

        getChildren().add(p2Button);
        getChildren().add(exitButton);
    }
}
