package io.github.hulang1024.chinesechess.scene.chessplay;

import io.github.hulang1024.chinesechess.client.message.server.lobby.LobbyRoom.LobbyRoomPlayerInfo;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.HostEnum;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.Text;

public class PlayerInfoContainer extends VBox {
    private Text nicknameText = new Text();
    private Text hostText = new Text();
    private Text readyText = new Text();

    public PlayerInfoContainer() {
        setMinHeight(200);
        getChildren().add(nicknameText);
        getChildren().add(readyText);
        getChildren().add(hostText);
    }

    public void load(LobbyRoomPlayerInfo player) {
        nicknameText.setFont(Font.font(16));
        nicknameText.setText("昵称: " + player.getNickname());
        setReadyState(player.isReadyed());
    }

    public void clear() {
        nicknameText.setText("-");
        hostText.setText("-");
        readyText.setText("-");
    }

    public void setHost(HostEnum host) {
        hostText.setFont(Font.font(16));
        hostText.setFill(host == HostEnum.RED ? Color.RED : Color.BLACK);
        hostText.setText(host == HostEnum.RED ? "红方" : "黑方");
    }

    public void setReadyState(boolean readyed) {
        readyText.setText(readyed ? "已准备" : "未准备");
        readyText.setFont(Font.font(16));
        readyText.setFill(readyed ? Color.GREENYELLOW : Color.RED);
    }
}
