package io.github.hulang1024.chinesechess.scene.lobby.room;

import io.github.hulang1024.chinesechess.client.message.server.lobby.LobbyRoom;
import javafx.event.EventHandler;
import javafx.geometry.Insets;
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
        rect.setWidth(100);
        rect.setHeight(50);
        boolean isFull = room.getPlayerCount() == 2;
        rect.setFill(isFull ? Color.ORANGE : Color.rgb(0, 200, 0, 0.9));
        getChildren().add(rect);

        Text nameText = new Text(0, 16, room.getName());
        nameText.setFont(Font.font(16));
        nameText.setFill(Color.BLACK);
        getChildren().add(nameText);

        setOnMouseClicked((event) -> {
            onJoin.handle(event);
        });
    }
}