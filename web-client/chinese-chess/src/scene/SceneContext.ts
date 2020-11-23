import ConfigManager from "../config/ConfigManager";
import APIAccess from "../online/api/APIAccess";
import ChannelManager from "../online/chat/ChannelManager";
import SocketClient from "../online/socket";
import ChatOverlay from "../overlay/chat/ChatOverlay";
import Toolbar from "../overlay/toolbar/Toolbar";

export default class SceneContext {
    stage: egret.Stage;
    sceneContainer: egret.DisplayObjectContainer;
    channelManager: ChannelManager;
    chatOverlay: ChatOverlay;
    toolbar: Toolbar;
    api: APIAccess;
    socketClient: SocketClient;
    configManager: ConfigManager;
}
