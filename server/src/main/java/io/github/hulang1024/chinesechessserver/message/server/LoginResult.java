package io.github.hulang1024.chinesechessserver.message.server;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import io.github.hulang1024.chinesechessserver.message.server.player.RoomPlayerInfo;
import lombok.Data;

@Data
public class LoginResult extends ServerMessage {
    private RoomPlayerInfo user;
    
    public LoginResult() {
        super("login.result");
    }
}
