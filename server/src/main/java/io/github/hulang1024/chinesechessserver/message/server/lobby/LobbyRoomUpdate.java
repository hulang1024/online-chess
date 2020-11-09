package io.github.hulang1024.chinesechessserver.message.server.lobby;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import io.github.hulang1024.chinesechessserver.message.server.room.RoomInfo;
import lombok.Data;

@Data
public class LobbyRoomUpdate extends ServerMessage {
    private RoomInfo room;

    public LobbyRoomUpdate() {
        super("lobby.room_update");
    }
}
