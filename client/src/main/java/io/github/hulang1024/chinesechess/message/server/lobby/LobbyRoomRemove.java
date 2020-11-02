package io.github.hulang1024.chinesechess.message.server.lobby;

import io.github.hulang1024.chinesechess.message.ServerMessage;
import io.github.hulang1024.chinesechess.message.server.MessageType;
import lombok.Data;

@Data
@MessageType("lobby.room_remove")
public class LobbyRoomRemove extends ServerMessage {
    private long roomId;
}
