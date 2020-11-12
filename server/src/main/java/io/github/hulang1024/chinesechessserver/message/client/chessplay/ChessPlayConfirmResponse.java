package io.github.hulang1024.chinesechessserver.message.client.chessplay;

import io.github.hulang1024.chinesechessserver.message.ClientMessage;
import io.github.hulang1024.chinesechessserver.message.client.MessageType;
import lombok.Data;

@Data
@MessageType("chessplay.confirm_response")
public class ChessPlayConfirmResponse extends ClientMessage {
    private int reqType;
    private boolean ok;
}
