package io.github.hulang1024.chess.room.ws;

import io.github.hulang1024.chess.ws.ServerMessage;
import io.github.hulang1024.chess.room.Room;
import lombok.Data;

@Data
public class LobbyRoomUpdateServerMsg extends ServerMessage {
    private Room room;

    public LobbyRoomUpdateServerMsg(Room room) {
        super("lobby.room_update");
        this.room = room;
    }
}