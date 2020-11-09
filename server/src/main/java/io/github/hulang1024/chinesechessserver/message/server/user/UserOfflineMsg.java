package io.github.hulang1024.chinesechessserver.message.server.user;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class UserOfflineMsg extends ServerMessage {
    private long uid;
    private String nickname;
    
    public UserOfflineMsg() {
        super("user.offline");
    }
}
