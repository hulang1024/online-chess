package io.github.hulang1024.chinesechess.scene.lobby;

import io.github.hulang1024.chinesechess.scene.AbstractScene;
import io.github.hulang1024.chinesechess.scene.SceneContext;
import io.github.hulang1024.chinesechess.client.ChineseChessClient;

/**
 * @author Hu Lang
 */
public class LobbyScene extends AbstractScene {
    private ChineseChessClient client = ChineseChessClient.getInstance();

    public LobbyScene(SceneContext sceneContext) {
        super(sceneContext);
    }
}
