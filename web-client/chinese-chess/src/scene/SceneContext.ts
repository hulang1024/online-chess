import ChatOverlay from "../overlay/chat/ChatOverlay";

export default class SceneContext {
    stage: egret.Stage;
    sceneContainer: egret.DisplayObjectContainer;
    chatOverlay: ChatOverlay;

    constructor(stage: egret.Stage, sceneContainer: egret.DisplayObjectContainer, chatOverlay: ChatOverlay) {
        this.stage = stage;
        this.sceneContainer = sceneContainer;
        this.chatOverlay = chatOverlay;
    }
}
