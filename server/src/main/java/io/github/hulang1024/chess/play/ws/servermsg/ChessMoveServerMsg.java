package io.github.hulang1024.chess.play.ws.servermsg;

import io.github.hulang1024.chess.play.rule.ChessPos;
import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class ChessMoveServerMsg extends ServerMessage {
    private int chessHost;
    private int moveType;
    private ChessPos fromPos;
    private ChessPos toPos;

    public ChessMoveServerMsg() {
        super("play.chess_move");
    }
}