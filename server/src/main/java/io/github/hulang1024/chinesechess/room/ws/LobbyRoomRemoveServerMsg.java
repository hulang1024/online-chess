package io.github.hulang1024.chinesechess.room.ws;

import io.github.hulang1024.chinesechess.ws.message.ServerMessage;
import io.github.hulang1024.chinesechess.room.Room;
import lombok.Data;

@Data
public class LobbyRoomRemoveSvrMsg extends ServerMessage {
    private long roomId;

    public LobbyRoomRemoveSvrMsg(Room room) {
        super("lobby.room_remove");
        this.roomId = room.getId();
    }
}
