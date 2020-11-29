package io.github.hulang1024.chinesechess.play.ws;

import io.github.hulang1024.chinesechess.ws.ClientMessage;
import io.github.hulang1024.chinesechess.ws.ClientMsgType;
import lombok.Data;


@Data
@ClientMsgType("play.game_over")
public class GameOverMsg extends ClientMessage {
    private int result;
}
