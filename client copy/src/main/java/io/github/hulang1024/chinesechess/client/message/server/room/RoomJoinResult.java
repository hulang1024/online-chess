package io.github.hulang1024.chinesechess.client.message.server.room;

import io.github.hulang1024.chinesechess.client.message.ServerMessage;
import io.github.hulang1024.chinesechess.client.message.server.lobby.LobbyRoom;
import io.github.hulang1024.chinesechess.client.message.server.lobby.LobbyRoom.LobbyRoomPlayerInfo;
import lombok.Data;

@Data
public class RoomJoinResult extends ServerMessage {
    private LobbyRoom room;
    private LobbyRoomPlayerInfo player;
}
