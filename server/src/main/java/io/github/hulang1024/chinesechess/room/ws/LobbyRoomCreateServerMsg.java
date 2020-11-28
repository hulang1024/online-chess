package io.github.hulang1024.chinesechess.room.ws;

import io.github.hulang1024.chinesechess.ws.message.ServerMessage;
import io.github.hulang1024.chinesechess.room.Room;
import lombok.Data;

@Data
public class LobbyRoomCreateSvrMsg extends ServerMessage {
    private Room room;

    public LobbyRoomCreateSvrMsg(Room room) {
        super("lobby.room_create");
        this.room = room;
    }
}
