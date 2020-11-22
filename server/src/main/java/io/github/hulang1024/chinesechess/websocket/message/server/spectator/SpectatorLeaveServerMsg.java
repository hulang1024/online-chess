package io.github.hulang1024.chinesechess.websocket.message.server.spectator;

import io.github.hulang1024.chinesechess.websocket.message.ServerMessage;
import lombok.Data;

@Data
public class SpectatorLeaveServerMsg extends ServerMessage {
    private long uid;
    private int spectatorCount;

    public SpectatorLeaveServerMsg() {
        super("spectator.leave");
    }
}
