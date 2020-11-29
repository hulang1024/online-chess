package io.github.hulang1024.chinesechess.play.ws;

import io.github.hulang1024.chinesechess.ws.ClientMessage;
import io.github.hulang1024.chinesechess.ws.ClientMsgType;
import lombok.Data;

@Data
@ClientMsgType("play.game_continue")
public class GameContinueMsg extends ClientMessage {
    private boolean ok;
}
