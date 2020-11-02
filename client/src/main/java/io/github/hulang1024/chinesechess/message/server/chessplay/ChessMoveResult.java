package io.github.hulang1024.chinesechess.message.server.chessplay;

import io.github.hulang1024.chinesechess.message.ServerMessage;
import io.github.hulang1024.chinesechess.message.server.MessageType;
import lombok.Data;

@Data
@MessageType("chessplay.chess_move")
public class ChessMoveResult extends ServerMessage {
    private int host;
    private int sourceChessRow;
    private int sourceChessCol;
    private int targetChessRow;
    private int targetChessCol;
}
