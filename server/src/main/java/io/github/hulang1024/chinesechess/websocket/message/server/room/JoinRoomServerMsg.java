package io.github.hulang1024.chinesechess.websocket.message.server.room;

import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.websocket.message.ServerMessage;
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
