package io.github.hulang1024.chinesechessserver.message.server.lobby;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class LobbyRoomUpdate extends ServerMessage {
    private LobbyRoom room;

    public LobbyRoomUpdate() {
        super("lobby.room_update");
    }
}
