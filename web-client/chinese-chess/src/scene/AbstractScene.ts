import ChatOverlay from "../overlay/chat/ChatOverlay";
import SceneContext from "./SceneContext";
import SceneManager, { SceneBuilder } from "./scene_manger";

export default abstract class AbstractScene extends egret.DisplayObjectContainer {
    private sceneManager: SceneManager;
    protected context: SceneContext;
    private onVisibilitychange: any;

    constructor(context: SceneContext) {
        super();
        this.context = context;
        this.sceneManager = SceneManager.of(context);

        document.addEventListener('visibilitychange', this.onVisibilitychange = () => {
            this.onAppVisibilityChange(document.hidden);
        });
    }

    onSceneExit() {
        document.removeEventListener('visibilitychange', this.onVisibilitychange);
    }

    onAppVisibilityChange(hidden: boolean) {}

    protected pushScene(sceneBuilder: SceneBuilder) {        
        this.onSceneExit();
        this.sceneManager.pushScene(sceneBuilder);
    }

    protected popScene() {
        this.onSceneExit();
        this.sceneManager.popScene();
    }
}
