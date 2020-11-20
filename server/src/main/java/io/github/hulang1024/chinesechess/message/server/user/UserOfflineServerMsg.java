package io.github.hulang1024.chinesechess.message.server.user;

import io.github.hulang1024.chinesechess.message.ServerMessage;
import lombok.Data;

@Data
public class UserOfflineServerMsg extends ServerMessage {
    private long uid;
    private String nickname;
    
    public UserOfflineServerMsg() {
        super("user.offline");
    }
}
