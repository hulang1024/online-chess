package io.github.hulang1024.chinesechessserver.convert;

import java.util.stream.Collectors;

import io.github.hulang1024.chinesechessserver.room.Room;
import io.github.hulang1024.chinesechessserver.message.server.room.RoomInfo;

public class RoomConvert {
    public RoomInfo toRoomInfo(Room room) {
        RoomInfo result = new RoomInfo();
        result.setId(room.getId());
        result.setName(room.getName());
        result.setUserCount(room.getUserCount());
        result.setUsers(room.getUsers1().stream()
            .map(p -> { return new UserConvert().toRoomUserInfo(p); })
            .collect(Collectors.toList()));
        result.setSpectatorCount(room.getSpectators().size());
        result.setSpectators(room.getSpectators().stream()
            .map(p -> { return new UserConvert().toRoomUserInfo(p); })
            .collect(Collectors.toList()));
        result.setOwnerUserId(room.getOwner().getId());
        result.setChannelId(room.getChannel().getId());
        result.setLocked(room.isLocked());
        result.setStatus(room.calcStatus());
        return result;
    }
}
