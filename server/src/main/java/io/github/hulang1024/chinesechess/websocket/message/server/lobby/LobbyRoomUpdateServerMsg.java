package io.github.hulang1024.chinesechess.websocket.message.server.lobby;

import io.github.hulang1024.chinesechess.websocket.message.ServerMessage;
import io.github.hulang1024.chinesechess.room.Room;
import lombok.Data;

@Data
public class LobbyRoomUpdateServerMsg extends ServerMessage {
    private Room room;

    public LobbyRoomUpdateServerMsg(Room room) {
        super("lobby.room_update");
        this.room = room;
    }
}
