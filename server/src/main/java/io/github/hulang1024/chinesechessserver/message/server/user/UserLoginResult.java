package io.github.hulang1024.chinesechessserver.message.server.user;

import io.github.hulang1024.chinesechessserver.database.entity.EntityUser;
import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class UserLoginResult extends ServerMessage {
    private EntityUser user;
    
    public UserLoginResult() {
        super("user.login");
    }
}
