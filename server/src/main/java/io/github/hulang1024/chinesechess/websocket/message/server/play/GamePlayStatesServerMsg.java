package io.github.hulang1024.chinesechess.websocket.message.server.play;

import io.github.hulang1024.chinesechess.play.GamePlayStatesResponse;
import io.github.hulang1024.chinesechess.websocket.message.ServerMessage;
import lombok.Data;

@Data
public class GamePlayStatesServerMsg extends ServerMessage {
    private GamePlayStatesResponse states;

    public GamePlayStatesServerMsg() {
        super("play.game_states");
    }
}
