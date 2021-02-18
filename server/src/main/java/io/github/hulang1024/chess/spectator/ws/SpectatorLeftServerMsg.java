package io.github.hulang1024.chess.spectator.ws;

import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class SpectatorLeftServerMsg extends ServerMessage {
    private long uid;
    private int spectatorCount;

    public SpectatorLeftServerMsg() {
        super("spectator.left");
    }
}