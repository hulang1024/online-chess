package io.github.hulang1024.chinesechess.play.ws;

import io.github.hulang1024.chinesechess.ws.message.ClientMessage;
import io.github.hulang1024.chinesechess.ws.message.ClientMsgType;
import lombok.Data;

@Data
@ClientMsgType("play.confirm_response")
public class ConfirmResponseMsg extends ClientMessage {
    private int reqType;
    private boolean ok;
}
