package io.github.hulang1024.chinesechess.client.message.server.chessplay;

import io.github.hulang1024.chinesechess.client.message.ServerMessage;
import lombok.Data;

@Data
public class ChessMoveResult extends ServerMessage {
    private int host;
    private int sourceChessRow;
    private int sourceChessCol;
    private int targetChessRow;
    private int targetChessCol;
}
