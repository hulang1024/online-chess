package io.github.hulang1024.chinesechess.play.message;

import io.github.hulang1024.chinesechess.play.rule.ChessPos;
import io.github.hulang1024.chinesechess.message.ClientMessage;
import io.github.hulang1024.chinesechess.message.ClientMsgType;
import lombok.Data;

@Data
@ClientMsgType("play.chess_pick")
public class ChessPickMsg extends ClientMessage {
    private ChessPos pos;
    private boolean pickup;
}
