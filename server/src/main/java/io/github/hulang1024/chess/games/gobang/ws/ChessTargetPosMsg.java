package io.github.hulang1024.chess.games.gobang.ws;

import io.github.hulang1024.chess.games.chess.ChessPos;
import io.github.hulang1024.chess.ws.ClientMessage;
import io.github.hulang1024.chess.ws.ClientMsgType;
import lombok.Data;

@Data
@ClientMsgType("play.gobang.chess_target_pos")
public class ChessTargetPosMsg extends ClientMessage {
    private int chess;
    private ChessPos pos;
}