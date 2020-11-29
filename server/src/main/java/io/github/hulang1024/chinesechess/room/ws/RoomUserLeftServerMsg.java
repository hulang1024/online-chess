package io.github.hulang1024.chinesechess.room.ws;

import io.github.hulang1024.chinesechess.ws.ServerMessage;
import lombok.Data;

@Data
public class RoomUserLeftServerMsg extends ServerMessage {
    private long uid;
    
    public RoomUserLeftServerMsg() {
        super("room.user_left");
    }
}
