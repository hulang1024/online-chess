package io.github.hulang1024.chinesechess.room.ws;

import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.ws.message.ServerMessage;
import io.github.hulang1024.chinesechess.room.Room;
import lombok.Data;

@Data
public class JoinRoomServerMsg extends ServerMessage {
    private Room room;
    private User user;
    
    public JoinRoomServerMsg() {
        super("room.join");
    }
}
