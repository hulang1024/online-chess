package io.github.hulang1024.chinesechess.client.message.server.lobby;

import io.github.hulang1024.chinesechess.client.message.ServerMessage;
import lombok.Data;

@Data
public class RoomCreateResult extends ServerMessage {
    private LobbyRoom room;
}
