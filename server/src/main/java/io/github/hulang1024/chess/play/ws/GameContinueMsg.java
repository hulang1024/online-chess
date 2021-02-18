package io.github.hulang1024.chess.play.ws;

import io.github.hulang1024.chess.ws.ClientMessage;
import io.github.hulang1024.chess.ws.ClientMsgType;
import lombok.Data;

@Data
@ClientMsgType("play.game_continue")
public class GameContinueMsg extends ClientMessage {
    private boolean ok;
}