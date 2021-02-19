package io.github.hulang1024.chess.games.chinesechess.ws;

import io.github.hulang1024.chess.games.chess.ChessPos;
import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class ChessPickServerMsg extends ServerMessage {
    private int chessHost;
    private ChessPos pos;
    private boolean pickup;

    public ChessPickServerMsg() {
        super("play.chinese_chess.chess_pick");
    }
}