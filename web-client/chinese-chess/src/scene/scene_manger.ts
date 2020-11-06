import AbstractScene from "./AbstractScene";
import SceneContext from "./SceneContext";

export default class SceneManager {
    private context: SceneContext;
    private static currentScene: AbstractScene;
    private static sceneStack: Array<SceneBuilder> = [];

    static of(context: SceneContext) {
        let sceneManager = new SceneManager();
        sceneManager.context = context;
        return sceneManager;
    }

    pushScene(sceneBuilder: SceneBuilder) {
        SceneManager.sceneStack.push(sceneBuilder);
        this.setCurrentScene(sceneBuilder);
    }

    popScene() {
        SceneManager.sceneStack.pop();
        const sceneBuilder = SceneManager.sceneStack[SceneManager.sceneStack.length - 1];
        this.setCurrentScene(sceneBuilder);
    }

    private setCurrentScene(sceneBuilder: SceneBuilder) {
        const { stage } = this.context;
        if (SceneManager.currentScene) {
            stage.removeChild(SceneManager.currentScene);
        }
        SceneManager.currentScene = sceneBuilder(this.context);
        stage.addChild(SceneManager.currentScene);
    }
}

export interface SceneBuilder {
    (context: SceneContext): AbstractScene;
}
