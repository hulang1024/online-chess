package io.github.hulang1024.chinesechess.scene;

import javafx.scene.Scene;

/**
 * @author Hu Lang
 */
public class SceneManager {
    private SceneContext sceneContext;


    public static SceneManager of(SceneContext sceneContext) {
        SceneManager sceneManager = new SceneManager();
        sceneManager.sceneContext = sceneContext;
        return sceneManager;
    }

    public void pushScene(AbstractScene scene) {
        sceneContext.getPrimaryStage().setScene(new Scene(scene));
    }
}
