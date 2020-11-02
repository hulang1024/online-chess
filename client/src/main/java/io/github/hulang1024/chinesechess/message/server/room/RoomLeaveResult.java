package io.github.hulang1024.chinesechess.message.server.room;

import io.github.hulang1024.chinesechess.message.ServerMessage;
import io.github.hulang1024.chinesechess.message.server.MessageType;
import io.github.hulang1024.chinesechess.message.server.lobby.LobbyRoom.LobbyRoomPlayerInfo;
import lombok.Data;

@Data
@MessageType("room.leave")
public class RoomLeaveResult extends ServerMessage {
    private LobbyRoomPlayerInfo player;
}
