package io.github.hulang1024.chinesechessserver.message.server.lobby;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class LobbyRoomRemove extends ServerMessage {
    private long roomId;

    public LobbyRoomRemove() {
        super("lobby.room_remove");
    }
}
