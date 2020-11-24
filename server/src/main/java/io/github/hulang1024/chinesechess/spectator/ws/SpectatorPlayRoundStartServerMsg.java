package io.github.hulang1024.chinesechess.spectator.ws;

import io.github.hulang1024.chinesechess.ws.message.ServerMessage;
import lombok.Data;

@Data
public class SpectatorPlayRoundStartServerMsg extends ServerMessage {
    private long redChessUid;
    private long blackChessUid;

    public SpectatorPlayRoundStartServerMsg() {
        super("spectator.play.round_start");
    }
}
