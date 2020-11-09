package io.github.hulang1024.chinesechessserver.message.server.chessplay;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class ChessPlayReadyResult extends ServerMessage {
    private long uid;
    private boolean readyed;
    
    public ChessPlayReadyResult() {
      super("chessplay.ready");
    }
}
