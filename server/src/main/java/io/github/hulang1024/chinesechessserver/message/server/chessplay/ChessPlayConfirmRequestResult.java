package io.github.hulang1024.chinesechessserver.message.server.chessplay;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class ChessPlayConfirmRequestResult extends ServerMessage {
    private int reqType;
    private int chessHost;
    
    public ChessPlayConfirmRequestResult() {
        super("chessplay.confirm_request");
    }
}
