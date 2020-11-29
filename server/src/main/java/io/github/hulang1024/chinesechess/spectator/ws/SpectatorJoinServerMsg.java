package io.github.hulang1024.chinesechess.spectator.ws;

import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.ws.ServerMessage;
import lombok.Data;

@Data
public class SpectatorJoinServerMsg extends ServerMessage {
    private User user;
    private int spectatorCount;

    public SpectatorJoinServerMsg() {
        super("spectator.join");
    }
}
