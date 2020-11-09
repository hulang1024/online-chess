package io.github.hulang1024.chinesechessserver.message.client.chessplay;

import io.github.hulang1024.chinesechessserver.domain.chinesechess.rule.ChessPos;
import io.github.hulang1024.chinesechessserver.message.ClientMessage;
import io.github.hulang1024.chinesechessserver.message.client.MessageType;
import lombok.Data;

@Data
@MessageType("chessplay.chess_pick")
public class ChessPick extends ClientMessage {
    private ChessPos pos;
    private boolean pickup;
}
