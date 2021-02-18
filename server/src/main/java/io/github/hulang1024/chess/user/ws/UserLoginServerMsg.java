package io.github.hulang1024.chess.user.ws;

import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class UserLoginServerMsg extends ServerMessage {

    public UserLoginServerMsg(int code) {
        super("user.login");
        this.code = code;
    }
}