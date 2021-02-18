package io.github.hulang1024.chess.spectator.ws;

import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class SpectatorJoinServerMsg extends ServerMessage {
    private User user;
    private int spectatorCount;

    public SpectatorJoinServerMsg() {
        super("spectator.join");
    }
}