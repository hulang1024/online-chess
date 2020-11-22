package io.github.hulang1024.chinesechess.websocket.message.server.room;

import io.github.hulang1024.chinesechess.websocket.message.ServerMessage;
import lombok.Data;

@Data
public class LeaveRoomServerMsg extends ServerMessage {
    private long uid;
    
    public LeaveRoomServerMsg() {
        super("room.leave");
    }
}
