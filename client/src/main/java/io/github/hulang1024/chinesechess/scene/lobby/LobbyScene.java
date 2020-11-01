package io.github.hulang1024.chinesechess.scene.lobby;

import io.github.hulang1024.chinesechess.scene.AbstractScene;
import io.github.hulang1024.chinesechess.scene.SceneContext;
import io.github.hulang1024.chinesechess.scene.SessionManager;
import io.github.hulang1024.chinesechess.scene.chessplay.OnlineChessPlayScene;
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
import io.github.hulang1024.chinesechess.client.message.server.room.RoomCreateResult;
import io.github.hulang1024.chinesechess.client.message.server.lobby.LobbyRoom;
import io.github.hulang1024.chinesechess.client.message.server.lobby.SearchRoomsResult;
import io.github.hulang1024.chinesechess.client.message.server.room.RoomJoinResult;
import io.github.hulang1024.chinesechess.client.message.MessageHandler;
import io.github.hulang1024.chinesechess.client.message.client.lobby.SearchRooms;
import io.github.hulang1024.chinesechess.client.message.client.room.RoomCreate;
import io.github.hulang1024.chinesechess.client.message.client.room.RoomJoin;
import io.github.hulang1024.chinesechess.client.message.client.room.QuickMatch;

/**
 * @author Hu Lang
 */
public class LobbyScene extends AbstractScene {
    private ChineseChessClient client = ChineseChessClient.getInstance();
    private MessageHandler<SearchRoomsResult> searchRoomsMessageHandler;
    private MessageHandler<RoomJoinResult> roomJoinMessageHandler;
    FlowPane roomContainer = new FlowPane();

    public LobbyScene(SceneContext sceneContext) {
        super(sceneContext);

        client.send(new SearchRooms());
        
        roomContainer.setPadding(new Insets(40, 40, 40, 40));

        Button createButton = new Button("创建房间");
        createButton.setOnMouseClicked((event) -> {
            client.addMessageHandler(RoomCreateResult.class, (message) -> {
                if (message.getCode() != 0) {
                    return;
                }
                Platform.runLater(() -> {
                    addRoom(message.getRoom());
                });
            });
            client.send(new RoomCreate());
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
        roomScrollPane.setContent(roomContainer);

        VBox child = new VBox();
        
        child.getChildren().addAll(lobbyHead, roomScrollPane);

        getChildren().add(child);

        client.addMessageHandler(SearchRoomsResult.class, searchRoomsMessageHandler = (message) -> {
            Platform.runLater(() -> {
                roomContainer.getChildren().clear();
                message.getRooms().forEach(this::addRoom);
            });
        });

        client.addMessageHandler(RoomJoinResult.class, roomJoinMessageHandler = (message) -> {
            if (message.getCode() == 2) {
                client.send(new SearchRooms());
                return;       
            }
            if (message.getCode() != 0) {
                return;
            }
            Platform.runLater(() -> {
                SessionManager.player = message.getPlayer();
                pushScene((context) -> new OnlineChessPlayScene(context, message.getRoom()));
            });
        });
    }

    @Override
    public void onSceneExit() {
        client.removeMessageHandler(SearchRoomsResult.class, searchRoomsMessageHandler);
        client.removeMessageHandler(RoomJoinResult.class, roomJoinMessageHandler);
    }

    public void addRoom(LobbyRoom room) {
        DrawableLobbyRoom drawableRoom = new DrawableLobbyRoom(
            room,
            (event) -> {
                RoomJoin roomJoin = new RoomJoin();
                roomJoin.setRoomId(room.getId());
                client.send(roomJoin);
            });
        this.roomContainer.getChildren().add(drawableRoom);
    }
}
