package io.github.hulang1024.chinesechess.scene;

import javafx.stage.Stage;

/**
 * @author Hu Lang
 */
public class SceneContext {
    private Stage primaryStage;

    public SceneContext(Stage primaryStage) {
        this.primaryStage = primaryStage;
    }

    public Stage getPrimaryStage() {
        return primaryStage;
    }

}
