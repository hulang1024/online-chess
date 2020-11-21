package io.github.hulang1024.chinesechess.websocket.message.server.spectator;

import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.websocket.message.ServerMessage;
import lombok.Data;

@Data
public class SpectatorLeaveServerMsg extends ServerMessage {
    private User user;
    private int spectatorCount;

    public SpectatorLeaveServerMsg() {
        super("spectator.leave");
    }
}
