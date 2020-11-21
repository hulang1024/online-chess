package io.github.hulang1024.chinesechess.play.message;

import io.github.hulang1024.chinesechess.websocket.message.ClientMessage;
import io.github.hulang1024.chinesechess.websocket.message.ClientMsgType;
import lombok.Data;

@Data
@ClientMsgType("play.ready")
public class ReadyMsg extends ClientMessage {
    private Boolean readied;
}
