package io.github.hulang1024.chinesechess.message.server.lobby;

import io.github.hulang1024.chinesechess.message.ServerMessage;
import io.github.hulang1024.chinesechess.room.Room;
import lombok.Data;

@Data
public class LobbyRoomRemoveServerMsg extends ServerMessage {
    private long roomId;

    public LobbyRoomRemoveServerMsg(Room room) {
        super("lobby.room_remove");
        this.roomId = room.getId();
    }
}
