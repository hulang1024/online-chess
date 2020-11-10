import SceneContext from "./SceneContext";
import SceneManager, { SceneBuilder } from "./scene_manger";

export default abstract class AbstractScene extends egret.DisplayObjectContainer {
    private sceneManager: SceneManager;
    private context: SceneContext;

    constructor(context: SceneContext) {
        super();
        this.context = context;
        this.sceneManager = SceneManager.of(context);
    }

    onSceneExit() {}

    protected pushScene(sceneBuilder: SceneBuilder) {        
        this.onSceneExit();
        this.sceneManager.pushScene(sceneBuilder);
    }

    protected popScene() {
        this.onSceneExit();
        this.sceneManager.popScene();
    }
}
