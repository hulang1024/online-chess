package io.github.hulang1024.chinesechessserver.message.server.user;

import io.github.hulang1024.chinesechessserver.entity.User;
import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class UserLoginResult extends ServerMessage {
    private User user;
    
    public UserLoginResult() {
        super("user.login");
    }
}
