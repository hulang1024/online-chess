package io.github.hulang1024.chess.play.ws.servermsg;

import io.github.hulang1024.chess.play.rule.ChessPos;
import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class ChessPickServerMsg extends ServerMessage {
    private int chessHost;
    private ChessPos pos;
    private boolean pickup;

    public ChessPickServerMsg() {
        super("play.chess_pick");
    }
}