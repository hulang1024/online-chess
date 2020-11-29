package io.github.hulang1024.chinesechess.room.ws;

import io.github.hulang1024.chinesechess.ws.ServerMessage;
import io.github.hulang1024.chinesechess.room.Room;
import lombok.Data;

@Data
public class LobbyRoomCreateServerMsg extends ServerMessage {
    private Room room;

    public LobbyRoomCreateServerMsg(Room room) {
        super("lobby.room_create");
        this.room = room;
    }
}
