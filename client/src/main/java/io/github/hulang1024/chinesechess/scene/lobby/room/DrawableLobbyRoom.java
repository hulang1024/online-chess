package io.github.hulang1024.chinesechess.scene.lobby.room;

import java.util.ArrayList;
import java.util.List;

import io.github.hulang1024.chinesechess.message.server.lobby.LobbyRoom;
import io.github.hulang1024.chinesechess.message.server.lobby.LobbyRoom.LobbyRoomPlayerInfo;
import javafx.event.EventHandler;
import javafx.geometry.Insets;
import javafx.scene.Cursor;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Rectangle;
import javafx.scene.text.Font;
import javafx.scene.text.Text;

/**
 * 房间
 */
public class DrawableLobbyRoom extends Pane {
    private Rectangle rect = new Rectangle();
    private Text nameText = new Text(8, 24, null);
    private Text statusText = new Text(8, 40, null);
    private List<Text> playerTexts = new ArrayList<>();

    private LobbyRoom room;

    public DrawableLobbyRoom(LobbyRoom room, EventHandler<MouseEvent> onJoin) {
        this.room = room;
        setMinSize(100, 50);
        setPadding(new Insets(8, 8, 8, 8));

        rect.setWidth(200);
        rect.setHeight(100);
        rect.setCursor(Cursor.HAND);
        getChildren().add(rect);

        setRoomName(room.getName());
        setStatus(room.getStatus());

        getChildren().add(nameText);
        getChildren().add(statusText);

        addPlayerList(room.getPlayers());

        setOnMouseClicked(event -> {
            onJoin.handle(event);
        });
    }

    public void update(LobbyRoom newRoom) {
        if (!newRoom.getName().equals(room.getName())) {
            setRoomName(newRoom.getName());
        }
        if (newRoom.getStatus() != room.getStatus()) {
            setStatus(newRoom.getStatus());
        }

        boolean same = true;
        
        if (newRoom.getPlayerCount() != room.getPlayerCount()) {
            same = false;
        } else {
            int i = 0;
            while (i < room.getPlayers().size()) {
                if (newRoom.getPlayers().get(i).getId() != room.getPlayers().get(i).getId()) {
                    same = false;
                    break;
                }
                i++;
            }
        }

        if (!same) {
            getChildren().removeAll(playerTexts);
            playerTexts.clear();
            addPlayerList(newRoom.getPlayers());
        }

        this.room = newRoom;
    }

    public void setStatus(int status) {
        statusText.setFont(Font.font(14));
        statusText.setText(status == 1
            ? "未满 可加入"
            : status == 2 ? "即将开始" : "进行中");
        rect.setFill(status == 1
            ? Color.rgb(0, 200, 0, 0.9)
            : status == 2 ? Color.ORANGE : Color.GRAY);
    }
    
    public void setRoomName(String roomName) {
        nameText.setText("房间" + roomName);
        nameText.setFont(Font.font(16));
        nameText.setFill(Color.BLACK);
    }

    public void addPlayerList(List<LobbyRoomPlayerInfo> players) {
        if (players == null) {
            return;
        }

        int yFactor = 1;
        for (LobbyRoomPlayerInfo player : players) {
            Text playerText = new Text(8, 40 + 8 + 16 * yFactor++, 
                "玩家 " + (player.getNickname() != null ? player.getNickname() : player.getId()));
            playerText.setFont(Font.font(14));
            playerText.setFill(Color.BLACK);
            getChildren().add(playerText);
            playerTexts.add(playerText);
        }
    }

    public LobbyRoom getRoom() {
        return room;
    }
}