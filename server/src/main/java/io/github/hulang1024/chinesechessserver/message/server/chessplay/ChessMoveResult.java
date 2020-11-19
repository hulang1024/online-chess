package io.github.hulang1024.chinesechessserver.message.server.chessplay;

import io.github.hulang1024.chinesechessserver.play.rule.ChessPos;
import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class ChessMoveResult extends ServerMessage {
    private int chessHost;
    private int moveType;
    private ChessPos fromPos;
    private ChessPos toPos;

    public ChessMoveResult() {
        super("chessplay.chess_move");
    }
}
