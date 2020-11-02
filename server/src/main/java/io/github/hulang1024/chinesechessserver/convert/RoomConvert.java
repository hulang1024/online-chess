package io.github.hulang1024.chinesechessserver.convert;

import java.util.stream.Collectors;

import io.github.hulang1024.chinesechessserver.domain.Room;
import io.github.hulang1024.chinesechessserver.message.server.lobby.LobbyRoom;

public class RoomConvert {
    public LobbyRoom toLobbyRoom(Room room) {
        LobbyRoom result = new LobbyRoom();
        result.setId(room.getId());
        result.setName(room.getName());
        result.setPlayerCount(room.getPlayerCount());
        result.setPlayers(room.getPlayers().stream()
            .map(p -> { return new PlayerConvert().toRoomPlayerInfo(p); })
            .collect(Collectors.toList()));
        result.setStatus(room.calcStatus());
        return result;
    }
}
