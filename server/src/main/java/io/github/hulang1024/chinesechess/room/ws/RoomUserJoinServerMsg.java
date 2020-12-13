package io.github.hulang1024.chinesechess.room.ws;

import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.ws.ServerMessage;
import lombok.Data;

@Data
public class RoomUserJoinServerMsg extends ServerMessage {
    private User user;
    
    public RoomUserJoinServerMsg(User user) {
        super("room.user_join");

        this.user = user;
    }
}
