package io.github.hulang1024.chinesechess.spectator.ws;

import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.ws.message.ServerMessage;
import lombok.Data;

@Data
public class SpectatorJoinSvrMsg extends ServerMessage {
    private User user;
    private int spectatorCount;

    public SpectatorJoinSvrMsg() {
        super("spectator.join");
    }
}
