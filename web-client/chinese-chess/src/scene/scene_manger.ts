import AbstractScene from "./AbstractScene";
import SceneContext from "./SceneContext";

export default class SceneManager {
    private context: SceneContext;
    private sceneStack: Array<SceneBuilder> = [];
    public currentScene: AbstractScene;

    constructor(context: SceneContext) {
        this.context = context;
    }

    pushScene(sceneBuilder: SceneBuilder) {
        if (this.currentScene) {
            this.currentScene.onSceneExit();
        }
        this.sceneStack.push(sceneBuilder);
        this.setCurrentScene(sceneBuilder);
    }

    popScene() {
        if (this.currentScene) {
            this.currentScene.onSceneExit();
        }
        this.sceneStack.pop();
        const sceneBuilder = this.sceneStack[this.sceneStack.length - 1];
        this.setCurrentScene(sceneBuilder);
    }

    replaceScene(sceneBuilder: SceneBuilder) {
        if (this.currentScene) {
            this.currentScene.onSceneExit();
        }
        this.sceneStack.pop();
        this.setCurrentScene(sceneBuilder);
    }

    private setCurrentScene(sceneBuilder: SceneBuilder) {
        const { sceneContainer } = this.context;
        if (this.currentScene) {
            sceneContainer.removeChild(this.currentScene);
        }
        this.currentScene = sceneBuilder(this.context);
        sceneContainer.addChild(this.currentScene);
    }
}

export interface SceneBuilder {
    (context: SceneContext): AbstractScene;
}
