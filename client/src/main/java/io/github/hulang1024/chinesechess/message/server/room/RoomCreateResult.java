package io.github.hulang1024.chinesechess.message.server.room;

import io.github.hulang1024.chinesechess.message.ServerMessage;
import io.github.hulang1024.chinesechess.message.server.MessageType;
import io.github.hulang1024.chinesechess.message.server.lobby.LobbyRoom;
import lombok.Data;

@Data
@MessageType("room.create")
public class RoomCreateResult extends ServerMessage {
    private LobbyRoom room;
}
