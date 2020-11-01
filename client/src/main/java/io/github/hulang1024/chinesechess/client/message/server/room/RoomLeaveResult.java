package io.github.hulang1024.chinesechess.client.message.server.room;

import io.github.hulang1024.chinesechess.client.message.ServerMessage;
import io.github.hulang1024.chinesechess.client.message.server.lobby.LobbyRoom.LobbyRoomPlayerInfo;
import lombok.Data;

@Data
public class RoomLeaveResult extends ServerMessage {
    private LobbyRoomPlayerInfo player;
}
