package io.github.hulang1024.chinesechess.message.server.spectator;

import io.github.hulang1024.chinesechess.message.ServerMessage;
import lombok.Data;

@Data
public class SpectatorPlayRoundStartServerMsg extends ServerMessage {
    private long redChessUid;
    private long blackChessUid;

    public SpectatorPlayRoundStartServerMsg() {
        super("spectator.play.round_start");
    }
}
