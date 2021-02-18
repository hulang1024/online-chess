package io.github.hulang1024.chess.play.ws.servermsg;

import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class GameContinueResponseServerMsg extends ServerMessage {
    private boolean ok;
    private long uid;

    public GameContinueResponseServerMsg() {
        super("play.game_continue_response");
    }
}