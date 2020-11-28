package io.github.hulang1024.chinesechess.room.ws;

import io.github.hulang1024.chinesechess.ws.message.ServerMessage;
import lombok.Data;

@Data
public class RoomUserLeftSvrMsg extends ServerMessage {
    private long uid;
    
    public RoomUserLeftSvrMsg() {
        super("room.user_left");
    }
}
