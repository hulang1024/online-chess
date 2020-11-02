package io.github.hulang1024.chinesechess.scene;

import javafx.scene.layout.Background;
import javafx.scene.layout.BackgroundFill;
import javafx.scene.layout.FlowPane;
import javafx.scene.paint.Color;

/**
 * @author Hu Lang
 */
public abstract class AbstractScene extends FlowPane {
    protected SceneContext context;
    private SceneManager sceneManager;

    public AbstractScene(SceneContext context) {
        this.context = context;
        this.sceneManager = SceneManager.of(context);

        prefWidthProperty().bind(this.context.getPrimaryStage().widthProperty());
        prefHeightProperty().bind(this.context.getPrimaryStage().heightProperty());

        setBackground(new Background(new BackgroundFill(Color.GRAY, null ,null)));
    }

    public void onSceneExit() {
        
    }

    protected void pushScene(SceneBuilder sceneBuilder) {
        onSceneExit();
        sceneManager.pushScene(sceneBuilder);
    }

    protected void popScene() {
        onSceneExit();
        sceneManager.popScene();
    }
}
