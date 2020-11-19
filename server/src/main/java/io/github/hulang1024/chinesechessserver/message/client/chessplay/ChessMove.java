package io.github.hulang1024.chinesechessserver.message.client.chessplay;

import io.github.hulang1024.chinesechessserver.play.rule.ChessPos;
import io.github.hulang1024.chinesechessserver.message.ClientMessage;
import io.github.hulang1024.chinesechessserver.message.client.MessageType;
import lombok.Data;

@Data
@MessageType("chessplay.chess_move")
public class ChessMove extends ClientMessage {
    /**
     * 1=移动，2=吃子
     */
    private int moveType;
    private ChessPos fromPos;
    private ChessPos toPos;
}
