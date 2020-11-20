package io.github.hulang1024.chinesechess.message.server.room;

import io.github.hulang1024.chinesechess.message.ServerMessage;
import io.github.hulang1024.chinesechess.user.User;
import lombok.Data;

@Data
public class LeaveRoomServerMsg extends ServerMessage {
    private User user;
    
    public LeaveRoomServerMsg() {
        super("room.leave");
    }
}
