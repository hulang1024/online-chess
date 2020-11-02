package io.github.hulang1024.chinesechess.message.server.lobby;

import io.github.hulang1024.chinesechess.message.ServerMessage;
import io.github.hulang1024.chinesechess.message.server.MessageType;
import lombok.Data;

@Data
@MessageType("lobby.room_update")
public class LobbyRoomUpdate extends ServerMessage {
    private LobbyRoom room;
}
