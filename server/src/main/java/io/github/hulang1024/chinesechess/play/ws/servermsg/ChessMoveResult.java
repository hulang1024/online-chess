package io.github.hulang1024.chinesechess.play.ws.servermsg;

import io.github.hulang1024.chinesechess.play.rule.ChessPos;
import io.github.hulang1024.chinesechess.ws.message.ServerMessage;
import lombok.Data;

@Data
public class ChessMoveResult extends ServerMessage {
    private int chessHost;
    private int moveType;
    private ChessPos fromPos;
    private ChessPos toPos;

    public ChessMoveResult() {
        super("play.chess_move");
    }
}
