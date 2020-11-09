package io.github.hulang1024.chinesechessserver.message.server.spectator;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import io.github.hulang1024.chinesechessserver.message.server.room.RoomUserInfo;
import lombok.Data;

@Data
public class SpectatorJoinMsg extends ServerMessage {
    private RoomUserInfo user;

    public SpectatorJoinMsg() {
        super("spectator.join");
    }
}
