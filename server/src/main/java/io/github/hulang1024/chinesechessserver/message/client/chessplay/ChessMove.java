package io.github.hulang1024.chinesechessserver.message.client.chessplay;

import io.github.hulang1024.chinesechessserver.message.ClientMessage;
import io.github.hulang1024.chinesechessserver.message.client.MessageType;
import lombok.Data;

@Data
@MessageType("chessplay.chess_move")
public class ChessMove extends ClientMessage {
    private int host;
    private int sourceChessRow;
    private int sourceChessCol;
    private int targetChessRow;
    private int targetChessCol;
}
