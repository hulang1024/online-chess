package io.github.hulang1024.chinesechessserver.message.server.user;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class UserNicknameSetResult extends ServerMessage {
    private String nickname;
    
    public UserNicknameSetResult() {
        super("user.nickname_set");
    }
}
