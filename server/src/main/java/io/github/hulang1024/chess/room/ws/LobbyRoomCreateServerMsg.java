package io.github.hulang1024.chess.room.ws;

import io.github.hulang1024.chess.ws.ServerMessage;
import io.github.hulang1024.chess.room.Room;
import lombok.Data;

@Data
public class LobbyRoomCreateServerMsg extends ServerMessage {
    private Room room;

    public LobbyRoomCreateServerMsg(Room room) {
        super("lobby.room_create");
        this.room = room;
    }
}