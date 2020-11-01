package io.github.hulang1024.chinesechess.client.message.server.chessplay;

import io.github.hulang1024.chinesechess.client.message.ServerMessage;
import lombok.Data;

/**
 * 棋局开始
 * @author HuLang
 */
@Data
public class ChessPlayRoundStart extends ServerMessage {
    /**
     * 我方棋方：0=黑方，1=红方
     */
    private int host;
}
