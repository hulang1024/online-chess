package io.github.hulang1024.chinesechess.websocket.message.server.user;

import io.github.hulang1024.chinesechess.websocket.message.ServerMessage;
import lombok.Data;

@Data
public class UserOfflineServerMsg extends ServerMessage {
    private long uid;

    public UserOfflineServerMsg() {
        super("user.offline");
    }
}
