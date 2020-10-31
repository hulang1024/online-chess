package io.github.hulang1024.chinesechessserver.message.server.lobby;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class RoomCreateResult extends ServerMessage {
    private LobbyRoom room;

    public RoomCreateResult() {
        super("room.create");
    }
}
