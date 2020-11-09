package io.github.hulang1024.chinesechessserver.message.server.spectator;

import java.util.List;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import io.github.hulang1024.chinesechessserver.message.server.room.RoomInfo;
import lombok.Data;

@Data
public class RoomRoundStateMsg extends ServerMessage {
    private List<Chess> chesses;
    private RoomInfo room;
    private Integer activeChessHost;
    
    @Data
    public static class Chess {
        private int row;
        private int col;
        private int host;
        private char type;
    }

    public RoomRoundStateMsg() {
        super("spectator.room_round_state");
    }
}
