package io.github.hulang1024.chinesechess.room.ws;

import io.github.hulang1024.chinesechess.ws.message.ServerMessage;
import lombok.Data;

@Data
public class LeaveRoomServerMsg extends ServerMessage {
    private long uid;
    
    public LeaveRoomServerMsg() {
        super("room.leave");
    }
}
