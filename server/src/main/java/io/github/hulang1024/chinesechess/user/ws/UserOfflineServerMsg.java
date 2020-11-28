package io.github.hulang1024.chinesechess.user.ws;

import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.ws.message.ServerMessage;
import lombok.Data;

@Data
public class UserOfflineServerMsg extends ServerMessage {
    private long uid;

    public UserOfflineServerMsg(User user) {
        super("user.offline");
        this.uid = user.getId();
    }
}