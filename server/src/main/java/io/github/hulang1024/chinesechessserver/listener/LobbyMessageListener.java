package io.github.hulang1024.chinesechessserver.listener;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import io.github.hulang1024.chinesechessserver.listener.dto.Room;
import io.github.hulang1024.chinesechessserver.message.client.lobby.SearchRooms;
import io.github.hulang1024.chinesechessserver.message.client.room.Create;
import io.github.hulang1024.chinesechessserver.message.server.lobby.LobbyRoom;
import io.github.hulang1024.chinesechessserver.message.server.lobby.RoomCreateResult;
import io.github.hulang1024.chinesechessserver.message.server.lobby.SearchRoomsResult;

public class LobbyMessageListener extends MessageListener {
    private List<Room> rooms = new ArrayList<>();
    private static long roomId = 10000;

    @Override
    public void init() {
        addMessageHandler(SearchRooms.class, this::searchRooms);
        addMessageHandler(Create.class, this::createRoom);
    }

    private void searchRooms(SearchRooms searchParams) {
        SearchRoomsResult result = new SearchRoomsResult();
        result.setRooms(rooms.stream()
            .map(room -> {
                LobbyRoom lobbyRoom = new LobbyRoom();
                lobbyRoom.setId(room.getId());
                lobbyRoom.setName(room.getName());
                return lobbyRoom;
            })
            .collect(Collectors.toList()));

        send(result, searchParams.getSession());
    }

    private void createRoom(Create create) {
        // 根据请求创建房间
        Room room = new Room();
        room.setId(roomId++);
        room.setName(create.getRoomName() == null
            ? String.valueOf("#" + room.getId())
            : create.getRoomName());

        rooms.add(room);

        // 创建成功结果
        RoomCreateResult result = new RoomCreateResult();
        LobbyRoom lobbyRoom = new LobbyRoom();
        lobbyRoom.setId(room.getId());
        lobbyRoom.setName(room.getName());
        lobbyRoom.setPlayerCount(0);
        result.setRoom(lobbyRoom);

        // TODO: 加入房间

        send(result, create.getSession());

        // TODO: 广播
    }
}