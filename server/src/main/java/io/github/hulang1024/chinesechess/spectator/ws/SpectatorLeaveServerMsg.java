package io.github.hulang1024.chinesechess.spectator.ws;

import io.github.hulang1024.chinesechess.ws.message.ServerMessage;
import lombok.Data;

@Data
public class SpectatorLeaveServerMsg extends ServerMessage {
    private long uid;
    private int spectatorCount;

    public SpectatorLeaveServerMsg() {
        super("spectator.leave");
    }
}
