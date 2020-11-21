package io.github.hulang1024.chinesechess.websocket.message.server.user;

import io.github.hulang1024.chinesechess.websocket.message.ServerMessage;
import lombok.Data;

@Data
public class UserLoginServerMsg extends ServerMessage {

    public UserLoginServerMsg() {
        super("user.login");
    }
}
