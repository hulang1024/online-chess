package io.github.hulang1024.chinesechess.scene.lobby.room;

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
    public DrawableLobbyRoom(LobbyRoom room, EventHandler<MouseEvent> onJoin) {
        setMinSize(100, 50);
        setPadding(new Insets(8, 8, 8, 8));

        Rectangle rect = new Rectangle();
        rect.setWidth(200);
        rect.setHeight(80);
        rect.setFill(room.getStatus() == 1
            ? Color.rgb(0, 200, 0, 0.9)
            : room.getStatus() == 2 ? Color.ORANGE : Color.GRAY);
        rect.setCursor(Cursor.HAND);
        getChildren().add(rect);

        String statusText = room.getStatus() == 1
            ? "未满 可加入"
            : room.getStatus() == 2 ? "即将开始" : "进行中";
        Text nameText = new Text(8, 24, "房间" + room.getName() + "(" + statusText + ")");
        nameText.setFont(Font.font(16));
        nameText.setFill(Color.BLACK);
        getChildren().add(nameText);

        if (room.getPlayers() != null) {
            int n = 2;
            for (LobbyRoomPlayerInfo player : room.getPlayers()) {
                Text playerText = new Text(8, 16 + 16 * n++, 
                    "玩家 " + (player.getNickname() != null ? player.getNickname() : player.getId()));
                playerText.setFont(Font.font(14));
                playerText.setFill(Color.BLACK);
                getChildren().add(playerText);
            }
        }

        setOnMouseClicked(event -> {
            onJoin.handle(event);
        });
    }
}