package io.github.hulang1024.chinesechess.message.server.room;

import io.github.hulang1024.chinesechess.message.ServerMessage;
import io.github.hulang1024.chinesechess.room.Room;
import io.github.hulang1024.chinesechess.user.User;
import lombok.Data;

@Data
public class JoinRoomServerMsg extends ServerMessage {
    private Room room;
    private User user;
    
    public JoinRoomServerMsg() {
        super("room.join");
    }
}
