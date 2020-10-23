package io.github.hulang1024.chinesechess.scene;

import javafx.scene.layout.Background;
import javafx.scene.layout.BackgroundFill;
import javafx.scene.layout.FlowPane;
import javafx.scene.paint.Color;

/**
 * @author Hu Lang
 */
public class AbstractScene extends FlowPane {
    private SceneContext sceneContext;
    private SceneManager sceneManager;

    public AbstractScene(SceneContext sceneContext) {
        this.sceneContext = sceneContext;
        this.sceneManager = SceneManager.of(sceneContext);

        prefWidthProperty().bind(this.sceneContext.getPrimaryStage().widthProperty());
        prefHeightProperty().bind(this.sceneContext.getPrimaryStage().heightProperty());

        setBackground(new Background(new BackgroundFill(Color.GRAY, null ,null)));
    }

    protected void pushScene(AbstractScene scene) {
        sceneManager.pushScene(scene);
    }
}
