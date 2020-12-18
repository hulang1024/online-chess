package io.github.hulang1024.chinesechess.user.ws;

import io.github.hulang1024.chinesechess.ws.ClientMessage;
import io.github.hulang1024.chinesechess.ws.ClientMsgType;
import lombok.Data;

@Data
@ClientMsgType(value = "user_activity.exit", guest = true)
public class UserExitActivityMsg extends ClientMessage {
    private int code;
}
