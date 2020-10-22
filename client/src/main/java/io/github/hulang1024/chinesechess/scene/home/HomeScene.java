package io.github.hulang1024.chinesechess.scene.home;

import io.github.hulang1024.chinesechess.scene.AbstractScene;
import io.github.hulang1024.chinesechess.scene.SceneContext;
import io.github.hulang1024.chinesechess.scene.chessplay.ChessPlayScene;
import io.github.hulang1024.chinesechess.scene.home.menu.MainMenu;
import io.github.hulang1024.chinesechess.scene.home.menu.MenuMainEventHandler;
import io.github.hulang1024.chinesechess.scene.lobby.LobbyScene;
import javafx.scene.control.Control;
import javafx.scene.layout.BorderPane;

/**
 * @author Hu Lang
 */
public class HomeScene extends AbstractScene {

    public HomeScene(SceneContext sceneContext) {
        super(sceneContext);

        BorderPane pane = new BorderPane();
        pane.setPrefSize(Control.USE_PREF_SIZE, Control.USE_PREF_SIZE);

        MainMenu mainMenu = new MainMenu(new MenuMainEventHandler() {
            @Override
            public void onP2() {
                pushScene(new ChessPlayScene(sceneContext));
            }

            @Override
            public void onOnline() {
                pushScene(new LobbyScene(sceneContext));
            }

            @Override
            public void onExit() {
                System.exit(0);
            }
        });
        pane.setCenter(mainMenu);
        getChildren().add(pane);
    }
}
