package io.github.hulang1024.chinesechessserver.message.server.chessplay;

import io.github.hulang1024.chinesechessserver.domain.chinesechess.rule.ChessPos;
import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class ChessPickResult extends ServerMessage {
    private int chessHost;
    private ChessPos pos;
    private boolean pickup;

    public ChessPickResult() {
        super("chessplay.chess_pick");
    }
}
