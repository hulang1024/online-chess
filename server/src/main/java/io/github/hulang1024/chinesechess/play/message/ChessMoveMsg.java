package io.github.hulang1024.chinesechess.play.message;

import io.github.hulang1024.chinesechess.play.rule.ChessPos;
import io.github.hulang1024.chinesechess.message.ClientMessage;
import io.github.hulang1024.chinesechess.message.ClientMsgType;
import lombok.Data;

@Data
@ClientMsgType("play.chess_move")
public class ChessMoveMsg extends ClientMessage {
    /**
     * 1=移动，2=吃子
     */
    private int moveType;
    private ChessPos fromPos;
    private ChessPos toPos;
}
