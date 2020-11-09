package io.github.hulang1024.chinesechessserver.message.server.chessplay;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

/**
 * 棋局开始
 * @author HuLang
 */
@Data
public class ChessPlayRoundStart extends ServerMessage {
    /**
     * 棋方：0=黑方，1=红方
     */
    private int chessHost;

    public ChessPlayRoundStart() {
      super("chessplay.round_start");
    }
}
