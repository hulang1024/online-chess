package io.github.hulang1024.chinesechessserver.message.server.room;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class RoomJoinResult extends ServerMessage {
    private RoomInfo room;
    private RoomUserInfo user;
    
    public RoomJoinResult() {
        super("room.join");
    }
}
