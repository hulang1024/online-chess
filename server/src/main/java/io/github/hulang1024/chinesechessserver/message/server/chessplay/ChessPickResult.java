package io.github.hulang1024.chinesechessserver.message.server.chessplay;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class ChessPickResult extends ServerMessage {
    private int host;
    private int chessRow;
    private int chessCol;

    public ChessPickResult() {
        super("chessplay.chess_pick");
    }
}
