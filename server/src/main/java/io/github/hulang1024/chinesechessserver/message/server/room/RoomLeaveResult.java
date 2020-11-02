package io.github.hulang1024.chinesechessserver.message.server.room;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import io.github.hulang1024.chinesechessserver.message.server.player.RoomPlayerInfo;
import lombok.Data;

@Data
public class RoomLeaveResult extends ServerMessage {
    private RoomPlayerInfo player;
    
    public RoomLeaveResult() {
        super("room.leave");
    }
}
