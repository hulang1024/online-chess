package io.github.hulang1024.chinesechess.client.message.server.room;

import io.github.hulang1024.chinesechess.client.message.ServerMessage;
import io.github.hulang1024.chinesechess.client.message.server.lobby.LobbyRoom;
import lombok.Data;

@Data
public class RoomCreateResult extends ServerMessage {
    private LobbyRoom room;
}
