package io.github.hulang1024.chinesechess.message.server.chessplay;

import io.github.hulang1024.chinesechess.message.ServerMessage;
import io.github.hulang1024.chinesechess.message.server.MessageType;
import lombok.Data;

/**
 * 棋局开始
 * @author HuLang
 */
@Data
@MessageType("chessplay.round_start")
public class ChessPlayRoundStart extends ServerMessage {
    /**
     * 我方棋方：0=黑方，1=红方
     */
    private int host;
}
