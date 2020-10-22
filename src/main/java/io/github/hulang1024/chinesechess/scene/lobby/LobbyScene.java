package io.github.hulang1024.chinesechess.scene.lobby;

import io.github.hulang1024.chinesechess.scene.AbstractScene;
import io.github.hulang1024.chinesechess.scene.SceneContext;
import io.github.hulang1024.chinesechess.socket.ChineseChessWebSocketClient;

/**
 * @author Hu Lang
 */
public class LobbyScene extends AbstractScene {
    private ChineseChessWebSocketClient client = ChineseChessWebSocketClient.getInstance();

    public LobbyScene(SceneContext sceneContext) {
        super(sceneContext);
    }
}
