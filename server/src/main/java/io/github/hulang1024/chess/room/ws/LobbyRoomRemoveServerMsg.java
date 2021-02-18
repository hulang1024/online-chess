package io.github.hulang1024.chess.room.ws;

import io.github.hulang1024.chess.ws.ServerMessage;
import io.github.hulang1024.chess.room.Room;
import lombok.Data;

@Data
public class LobbyRoomRemoveServerMsg extends ServerMessage {
    private long roomId;

    public LobbyRoomRemoveServerMsg(Room room) {
        super("lobby.room_remove");
        this.roomId = room.getId();
    }
}