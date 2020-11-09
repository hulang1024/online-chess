package io.github.hulang1024.chinesechessserver.message.server.room;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class RoomLeaveResult extends ServerMessage {
    private RoomUserInfo user;
    
    public RoomLeaveResult() {
        super("room.leave");
    }
}
