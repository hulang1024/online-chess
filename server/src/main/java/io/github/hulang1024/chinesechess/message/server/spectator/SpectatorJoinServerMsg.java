package io.github.hulang1024.chinesechess.message.server.spectator;

import io.github.hulang1024.chinesechess.message.ServerMessage;
import io.github.hulang1024.chinesechess.user.User;
import lombok.Data;

@Data
public class SpectatorJoinServerMsg extends ServerMessage {
    private User user;
    private int spectatorCount;

    public SpectatorJoinServerMsg() {
        super("spectator.join");
    }
}
