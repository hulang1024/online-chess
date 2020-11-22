package io.github.hulang1024.chinesechess.play.message;

import io.github.hulang1024.chinesechess.websocket.message.ClientMessage;
import io.github.hulang1024.chinesechess.websocket.message.ClientMsgType;
import lombok.Data;

@Data
@ClientMsgType("play.offline_continue")
public class OfflineContinueClientMsg extends ClientMessage {
    private boolean ok;
}
