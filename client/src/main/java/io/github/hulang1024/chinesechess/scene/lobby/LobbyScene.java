package io.github.hulang1024.chinesechess.scene.lobby;

import io.github.hulang1024.chinesechess.scene.AbstractScene;
import io.github.hulang1024.chinesechess.scene.SceneContext;
import io.github.hulang1024.chinesechess.scene.SessionManager;
import io.github.hulang1024.chinesechess.scene.chessplay.OnlineChessPlayScene;
import io.github.hulang1024.chinesechess.scene.lobby.room.DrawableLobbyRoom;
import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.Alert.AlertType;
import javafx.scene.control.ScrollPane.ScrollBarPolicy;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.FlowPane;
import javafx.scene.layout.HBox;
import javafx.scene.text.Text;

import java.util.Optional;

import io.github.hulang1024.chinesechess.ChineseChessClient;
import io.github.hulang1024.chinesechess.message.server.room.RoomCreateResult;
import io.github.hulang1024.chinesechess.message.server.lobby.LobbyRoom;
import io.github.hulang1024.chinesechess.message.server.lobby.QuickMatchResult;
import io.github.hulang1024.chinesechess.message.server.lobby.SearchRoomsResult;
import io.github.hulang1024.chinesechess.message.server.player.PlayerNicknameSetResult;
import io.github.hulang1024.chinesechess.message.server.room.RoomJoinResult;
import io.github.hulang1024.chinesechess.message.MessageHandler;
import io.github.hulang1024.chinesechess.message.client.lobby.QuickMatch;
import io.github.hulang1024.chinesechess.message.client.lobby.SearchRooms;
import io.github.hulang1024.chinesechess.message.client.player.PlayerNicknameSet;
import io.github.hulang1024.chinesechess.message.client.room.RoomCreate;
import io.github.hulang1024.chinesechess.message.client.room.RoomJoin;

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
        createButton.setMinSize(100, 30);
        createButton.setOnMouseClicked((event) -> {
            client.addMessageOnceHandler(RoomCreateResult.class, (message) -> {
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
        quickMatchButton.setMinSize(100, 30);
        quickMatchButton.setOnMouseClicked((event) -> {
            client.addMessageOnceHandler(QuickMatchResult.class, (message) -> {
                Platform.runLater(() -> {
                    if (message.getCode() != 0) {
                        Alert alert = new Alert(AlertType.INFORMATION);
                        alert.initOwner(this.context.getPrimaryStage());
                        alert.setTitle("提示");
                        alert.setHeaderText("");
                        alert.setContentText("快速加入失败，原因："
                        + (message.getCode() == 2 ? "你已加入其它房间" : message.getCode() == 3 ? "没有可进入的房间" : "未知"));
                        alert.show();
                    } else {
                        // 成功会有加入房间事件消息
                    }
                });
            });

            client.send(new QuickMatch());
        });

        Button backButton = new Button("返回");
        backButton.setMinSize(100, 30);
        backButton.setOnMouseClicked((event) -> {
            popScene();
        });

        Button nicknameSetButton = new Button("设置昵称");
        nicknameSetButton.setMinSize(100, 30);
        nicknameSetButton.setOnMouseClicked((event) -> {
            client.addMessageOnceHandler(PlayerNicknameSetResult.class, (message) -> {
                Platform.runLater(() -> {
                    Alert alert = new Alert(message.getCode() == 0 ? AlertType.INFORMATION : AlertType.ERROR);
                    alert.initOwner(this.context.getPrimaryStage());
                    alert.setTitle("提示");
                    alert.setHeaderText("");
                    alert.setContentText("设置" + (message.getCode() == 0 ? "成功" : "失败"));
                    alert.show();
                    if (message.getCode() == 0) {
                        if (SessionManager.player != null) {
                            SessionManager.player.setNickname(message.getNickname());
                        }
                    }
                });
            });

            Optional<String> nicknameOpt = new PlayerNameInputDialog(this.context.getPrimaryStage()).showAndWait();
            if (nicknameOpt.isPresent()) {
                PlayerNicknameSet msg = new PlayerNicknameSet();
                msg.setNickname(nicknameOpt.get());
                client.send(msg);
            }
        });

        HBox lobbyHead = new HBox();
        lobbyHead.setAlignment(Pos.CENTER);
        lobbyHead.getChildren().addAll(backButton, createButton, quickMatchButton, nicknameSetButton);

        ScrollPane roomScrollPane = new ScrollPane();
        roomScrollPane.setVbarPolicy(ScrollBarPolicy.AS_NEEDED);
        roomScrollPane.setContent(roomContainer);

        BorderPane child = new BorderPane();
        child.minWidthProperty().bind(this.widthProperty());
        child.minHeightProperty().bind(this.heightProperty());
        child.setTop(lobbyHead);
        child.setCenter(roomScrollPane);

        getChildren().add(child);

        client.addMessageHandler(SearchRoomsResult.class, searchRoomsMessageHandler = (message) -> {
            Platform.runLater(() -> {
                roomContainer.getChildren().clear();
                if (message.getRooms().isEmpty()) {
                    roomContainer.getChildren().add(new Text("未找到房间"));
                } else {
                    message.getRooms().forEach(this::addRoom);
                }
            });
        });

        client.addMessageHandler(RoomJoinResult.class, roomJoinMessageHandler = (message) -> {
            Platform.runLater(() -> {
                if (message.getCode() == 2) {
                    Alert alert = new Alert(AlertType.WARNING);
                    alert.initOwner(this.context.getPrimaryStage());
                    alert.setTitle("提示");
                    alert.setHeaderText("");
                    alert.setContentText("该房间已不存在");
                    alert.show();
                    return;       
                }
                if (message.getCode() != 0 && message.getCode() != 4) {
                    return;
                }
                SessionManager.player = message.getPlayer();
                String nickname = SessionManager.player.getNickname();
                if (nickname == null || nickname.trim().length() == 0) {
                    Alert alert = new Alert(AlertType.INFORMATION);
                    alert.initOwner(this.context.getPrimaryStage());
                    alert.setTitle("提示");
                    alert.setHeaderText("");
                    alert.setContentText("你还没有一个昵称，去设置吧~");
                    alert.show();
                    return;
                }
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
