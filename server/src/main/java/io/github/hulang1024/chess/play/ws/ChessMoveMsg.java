package io.github.hulang1024.chess.play.ws;

import io.github.hulang1024.chess.play.rule.ChessPos;
import io.github.hulang1024.chess.ws.ClientMessage;
import io.github.hulang1024.chess.ws.ClientMsgType;
import lombok.Data;

@Data
@ClientMsgType("play.chess_move")
public class ChessMoveMsg extends ClientMessage {
    private ChessPos fromPos;
    private ChessPos toPos;
}