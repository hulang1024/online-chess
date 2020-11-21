import APIAccess from "../online/api/APIAccess";
import ChannelManager from "../online/chat/ChannelManager";
import SocketClient from "../online/socket";
import ChatOverlay from "../overlay/chat/ChatOverlay";

export default class SceneContext {
    stage: egret.Stage;
    sceneContainer: egret.DisplayObjectContainer;
    channelManager: ChannelManager;
    chatOverlay: ChatOverlay;
    api: APIAccess;
    socketClient: SocketClient;

    constructor(stage: egret.Stage, sceneContainer: egret.DisplayObjectContainer) {
        this.stage = stage;
        this.sceneContainer = sceneContainer;
    }
}
