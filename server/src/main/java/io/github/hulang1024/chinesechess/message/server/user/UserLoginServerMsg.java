package io.github.hulang1024.chinesechess.message.server.user;

import io.github.hulang1024.chinesechess.message.ServerMessage;
import lombok.Data;

@Data
public class UserLoginServerMsg extends ServerMessage {

    public UserLoginServerMsg() {
        super("user.login");
    }
}
