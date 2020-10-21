package io.github.hulang1024.chinesechess.scene;

import javafx.scene.layout.FlowPane;

/**
 * @author Hu Lang
 */
public class AbstractScene extends FlowPane {
    private SceneContext sceneContext;
    private SceneManager sceneManager;

    public AbstractScene(SceneContext sceneContext) {
        this.sceneManager = SceneManager.of(sceneContext);
    }

    protected void pushScene(AbstractScene scene) {
        sceneManager.pushScene(scene);
    }
}
