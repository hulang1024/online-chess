package io.github.hulang1024.chinesechess.play.ws;

import io.github.hulang1024.chinesechess.ws.ClientMessage;
import io.github.hulang1024.chinesechess.ws.ClientMsgType;
import lombok.Data;

@Data
@ClientMsgType("play.ready")
public class ReadyMsg extends ClientMessage {
    private Boolean readied;
}
