package io.github.hulang1024.chess.play.ws.servermsg;

import io.github.hulang1024.chess.play.GamePlayStatesResponse;
import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class GamePlayStatesServerMsg extends ServerMessage {
    private GamePlayStatesResponse states;

    public GamePlayStatesServerMsg() {
        super("play.game_states");
    }
}