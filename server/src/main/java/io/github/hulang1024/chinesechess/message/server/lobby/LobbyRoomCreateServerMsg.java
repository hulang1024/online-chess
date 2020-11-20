package io.github.hulang1024.chinesechess.message.server.lobby;

import io.github.hulang1024.chinesechess.message.ServerMessage;
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
