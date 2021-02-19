package io.github.hulang1024.chess.games.chinesechess.ws;

import io.github.hulang1024.chess.games.chess.ChessPos;
import io.github.hulang1024.chess.ws.ClientMessage;
import io.github.hulang1024.chess.ws.ClientMsgType;
import lombok.Data;

@Data
@ClientMsgType("play.chinese_chess.chess_move")
public class ChessMoveMsg extends ClientMessage {
    private ChessPos fromPos;
    private ChessPos toPos;
}