package io.github.hulang1024.chinesechess.scene;

import java.util.Stack;

import javafx.scene.Scene;

/**
 * @author Hu Lang
 */
public class SceneManager {
    private SceneContext sceneContext;
    private static Stack<SceneBuilder> sceneStack = new Stack<>();

    public static SceneManager of(SceneContext sceneContext) {
        SceneManager sceneManager = new SceneManager();
        sceneManager.sceneContext = sceneContext;
        return sceneManager;
    }

    public void pushScene(SceneBuilder sceneBuilder) {
        sceneStack.push(sceneBuilder);
        setCurrentScene(sceneBuilder);
    }

    public void popScene() {
        sceneStack.pop();
        setCurrentScene(sceneStack.peek());
    }

    private void setCurrentScene(SceneBuilder sceneBuilder) {
        sceneContext.getPrimaryStage().setScene(
            new Scene(sceneBuilder.build(sceneContext)));
    }
}
