package io.github.hulang1024.chinesechessserver.message.server.chessplay;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class ChessPlayConfirmResponseResult extends ServerMessage {
    private int reqType;
    private int chessHost;
    private boolean ok;

    public ChessPlayConfirmResponseResult() {
        super("chessplay.confirm_response");
    }
}
