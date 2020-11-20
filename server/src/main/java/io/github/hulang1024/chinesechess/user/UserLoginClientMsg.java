package io.github.hulang1024.chinesechess.user;

import io.github.hulang1024.chinesechess.message.ClientMessage;
import io.github.hulang1024.chinesechess.message.ClientMsgType;
import lombok.Data;

@Data
@ClientMsgType("user.login")
public class UserLoginClientMsg extends ClientMessage {
    private long userId;
}
