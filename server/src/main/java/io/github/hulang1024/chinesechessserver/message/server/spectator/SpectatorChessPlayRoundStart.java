package io.github.hulang1024.chinesechessserver.message.server.spectator;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class SpectatorChessPlayRoundStart extends ServerMessage {
    private long redChessUid;
    private long blackChessUid;

    public SpectatorChessPlayRoundStart() {
        super("spectator.chessplay.round_start");
    }
}
