package io.github.hulang1024.chess.play.ws.servermsg;

import io.github.hulang1024.chess.games.GameStatesResponse;
import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class GameStatesServerMsg extends ServerMessage {
    private GameStatesResponse states;

    public GameStatesServerMsg() {
        super("play.game_states");
    }
}