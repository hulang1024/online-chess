package io.github.hulang1024.chinesechess.user.ws;

import io.github.hulang1024.chinesechess.ws.message.ServerMessage;
import lombok.Data;

@Data
public class UserLoginServerMsg extends ServerMessage {

    public UserLoginServerMsg(int code) {
        super("user.login");
        this.code = code;
    }
}
