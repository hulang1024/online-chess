package io.github.hulang1024.chinesechess.user.login;

import io.github.hulang1024.chinesechess.websocket.message.ClientMessage;
import io.github.hulang1024.chinesechess.websocket.message.ClientMsgType;
import lombok.Data;

@Data
@ClientMsgType("user.login")
public class UserLoginClientMsg extends ClientMessage {
    private long userId;
}
