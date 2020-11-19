package io.github.hulang1024.chinesechessserver.room;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import io.github.hulang1024.chinesechessserver.chat.ChannelManager;
import io.github.hulang1024.chinesechessserver.chat.ChannelType;
import org.springframework.util.StringUtils;

import io.github.hulang1024.chinesechessserver.room.Room;
import io.github.hulang1024.chinesechessserver.message.client.lobby.SearchRooms;
import io.github.hulang1024.chinesechessserver.message.client.room.RoomCreate;

public class RoomService {
    private static long roomId = 10000;
    private static Map<Long, Room> roomMap = new ConcurrentHashMap<>();

    public Collection<Room> search(SearchRooms searchParams) {
        return roomMap.values();
    }

    public Collection<Room> getAllRooms() {
        return roomMap.values();
    }

    public Room create(RoomCreate create) {
        Room room = new Room();
        room.setId(roomId++);
        room.setName(StringUtils.isEmpty(create.getRoomName())
            ? String.valueOf("#" + room.getId())
            : create.getRoomName());
        room.setCreateAt(LocalDateTime.now());
        room.setPassword(StringUtils.isEmpty(create.getPassword()) ? null : create.getPassword());
        roomMap.put(room.getId(), room);

        return room;
    }

    public Room getById(long id) {
        return roomMap.get(id);
    }

    public void remove(Room room) {
        roomMap.remove(room.getId());
    }
}
