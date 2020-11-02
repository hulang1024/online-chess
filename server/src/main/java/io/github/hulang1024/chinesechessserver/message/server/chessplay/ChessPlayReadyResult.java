package io.github.hulang1024.chinesechessserver.message.server.chessplay;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import io.github.hulang1024.chinesechessserver.message.server.player.RoomPlayerInfo;
import lombok.Data;

@Data
public class ChessPlayReadyResult extends ServerMessage {
    private RoomPlayerInfo player;
    
    public ChessPlayReadyResult() {
      super("chessplay.ready");
    }
}
