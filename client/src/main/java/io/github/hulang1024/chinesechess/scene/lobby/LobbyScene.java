package io.github.hulang1024.chinesechess.scene.lobby;

import io.github.hulang1024.chinesechess.scene.AbstractScene;
import io.github.hulang1024.chinesechess.scene.SceneContext;
import io.github.hulang1024.chinesechess.scene.lobby.room.DrawableLobbyRoom;
import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.scene.control.Button;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.ScrollPane.ScrollBarPolicy;
import javafx.scene.layout.Background;
import javafx.scene.layout.FlowPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import io.github.hulang1024.chinesechess.client.ChineseChessClient;
import io.github.hulang1024.chinesechess.client.message.ServerMessageDispatcher;
import io.github.hulang1024.chinesechess.client.message.server.lobby.RoomCreateResult;
import io.github.hulang1024.chinesechess.client.message.server.lobby.SearchRoomsResult;
import io.github.hulang1024.chinesechess.client.message.client.lobby.SearchRooms;
import io.github.hulang1024.chinesechess.client.message.client.room.Create;
import io.github.hulang1024.chinesechess.client.message.client.room.QuickMatch;

/**
 * @author Hu Lang
 */
public class LobbyScene extends AbstractScene {
    private ChineseChessClient client = ChineseChessClient.getInstance();

    public LobbyScene(SceneContext sceneContext) {
        super(sceneContext);

        client.send(new SearchRooms());

        Button createButton = new Button("创建房间");
        createButton.setOnMouseClicked((event) -> {
            client.send(new Create());
        });

        Button quickMatchButton = new Button("快速加入");
        quickMatchButton.setOnMouseClicked((event) -> {
            client.send(new QuickMatch());
        });

        Button backButton = new Button("返回");
        backButton.setOnMouseClicked((event) -> {
            popScene();
        });

        HBox lobbyHead = new HBox();
        lobbyHead.getChildren().addAll(backButton, createButton, quickMatchButton);


        ScrollPane roomScrollPane = new ScrollPane();
        roomScrollPane.setPrefSize(-1, 500);
        roomScrollPane.setVmax(500);
        roomScrollPane.setVbarPolicy(ScrollBarPolicy.AS_NEEDED);
        roomScrollPane.setBackground(Background.EMPTY);
        FlowPane roomContainer = new FlowPane();
        roomContainer.setPadding(new Insets(40, 40, 40, 40));
        roomScrollPane.setContent(roomContainer);

        VBox child = new VBox();
        
        child.getChildren().addAll(lobbyHead, roomScrollPane);

        getChildren().add(child);

        ServerMessageDispatcher.addMessageHandler(SearchRoomsResult.class, (message) -> {
            Platform.runLater(() -> {
                message.getRooms().forEach(room -> {
                    roomContainer.getChildren().add(new DrawableLobbyRoom(room));
                });
            });
        });

        client.addMessageHandler(RoomCreateResult.class, (message) -> {
            Platform.runLater(() -> {
                roomContainer.getChildren().add(new DrawableLobbyRoom(message.getRoom()));
            });
        });
    }
}
