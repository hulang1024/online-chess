package io.github.hulang1024.chinesechess.scene.home;

import io.github.hulang1024.chinesechess.ChineseChessClient;
import io.github.hulang1024.chinesechess.scene.AbstractScene;
import io.github.hulang1024.chinesechess.scene.SceneContext;
import io.github.hulang1024.chinesechess.scene.chessplay.OfflineChessPlayScene;
import io.github.hulang1024.chinesechess.scene.home.menu.MainMenu;
import io.github.hulang1024.chinesechess.scene.home.menu.MenuMainEventHandler;
import io.github.hulang1024.chinesechess.scene.lobby.LobbyScene;
import javafx.scene.layout.BorderPane;

/**
 * @author Hu Lang
 */
public class HomeScene extends AbstractScene {

    public HomeScene(SceneContext sceneContext) {
        super(sceneContext);

        BorderPane pane = new BorderPane();
        pane.prefWidthProperty().bind(this.widthProperty());
        pane.prefHeightProperty().bind(this.heightProperty());

        MainMenu mainMenu = new MainMenu(new MenuMainEventHandler() {
            @Override
            public void onP2() {
                pushScene((context) -> new OfflineChessPlayScene(context));
            }

            @Override
            public void onOnline() {
                pushScene((context) -> new LobbyScene(context));
            }

            @Override
            public void onExit() {
                System.exit(0);
            }
        });
        pane.setCenter(mainMenu);
        getChildren().add(pane);

        ChineseChessClient.getInstance();
    }
}
