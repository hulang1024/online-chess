package io.github.hulang1024.chinesechess.play.ws;

import io.github.hulang1024.chinesechess.ws.message.ClientMessage;
import io.github.hulang1024.chinesechess.ws.message.ClientMsgType;
import lombok.Data;

@Data
@ClientMsgType("play.offline_continue")
public class OfflineContinueClientMsg extends ClientMessage {
    private boolean ok;
}
