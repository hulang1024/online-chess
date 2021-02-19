package io.github.hulang1024.chess.games.chinesechess.ws;

import io.github.hulang1024.chess.games.chess.ChessPos;
import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class ChessMoveServerMsg extends ServerMessage {
    private int chessHost;
    private int moveType;
    private ChessPos fromPos;
    private ChessPos toPos;

    public ChessMoveServerMsg() {
        super("play.chinese_chess.chess_move");
    }
}