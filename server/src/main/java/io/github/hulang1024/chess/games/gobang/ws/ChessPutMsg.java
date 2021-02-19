package io.github.hulang1024.chess.games.gobang.ws;

import io.github.hulang1024.chess.games.chess.ChessPos;
import io.github.hulang1024.chess.ws.ClientMessage;
import io.github.hulang1024.chess.ws.ClientMsgType;
import lombok.Data;

@Data
@ClientMsgType("play.gobang.chess_put")
public class ChessPutMsg extends ClientMessage {
    private int chess;
    private ChessPos pos;
}