package io.github.hulang1024.chinesechess.play.message;

import io.github.hulang1024.chinesechess.websocket.message.ClientMessage;
import io.github.hulang1024.chinesechess.websocket.message.ClientMsgType;
import lombok.Data;

@Data
@ClientMsgType("play.confirm_response")
public class ConfirmResponseMsg extends ClientMessage {
    private int reqType;
    private boolean ok;
}
