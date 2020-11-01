package io.github.hulang1024.chinesechessserver.message.server.room;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import io.github.hulang1024.chinesechessserver.message.server.RoomPlayerInfo;
import io.github.hulang1024.chinesechessserver.message.server.lobby.LobbyRoom;
import lombok.Data;

@Data
public class RoomJoinResult extends ServerMessage {
    private LobbyRoom room;
    private RoomPlayerInfo player;
    
    public RoomJoinResult() {
        super("room.join");
    }
}
