package io.github.hulang1024.chinesechess.play.message;

import io.github.hulang1024.chinesechess.message.ClientMessage;
import io.github.hulang1024.chinesechess.message.ClientMsgType;
import lombok.Data;

@Data
@ClientMsgType("play.confirm_request")
public class ConfirmRequestMsg extends ClientMessage {
    private int reqType;
}
