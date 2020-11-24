package io.github.hulang1024.chinesechess.play.ws;

import io.github.hulang1024.chinesechess.ws.message.ClientMessage;
import io.github.hulang1024.chinesechess.ws.message.ClientMsgType;
import lombok.Data;

@Data
@ClientMsgType("play.confirm_request")
public class ConfirmRequestMsg extends ClientMessage {
    private int reqType;
}
