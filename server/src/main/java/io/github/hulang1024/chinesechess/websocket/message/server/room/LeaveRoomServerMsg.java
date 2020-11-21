package io.github.hulang1024.chinesechess.websocket.message.server.room;

import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.websocket.message.ServerMessage;
import lombok.Data;

@Data
public class LeaveRoomServerMsg extends ServerMessage {
    private User user;
    
    public LeaveRoomServerMsg() {
        super("room.leave");
    }
}
