package io.github.hulang1024.chinesechessserver.message.server.spectator;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import io.github.hulang1024.chinesechessserver.message.server.room.RoomUserInfo;
import lombok.Data;

@Data
public class SpectatorLeaveMsg extends ServerMessage {
    private RoomUserInfo user;
    private int spectatorCount;

    public SpectatorLeaveMsg() {
        super("spectator.leave");
    }
}
