package io.github.hulang1024.chinesechess.client.message;

import java.util.Map;
import java.util.HashMap;

import io.github.hulang1024.chinesechess.client.message.server.lobby.RoomCreateResult;
import io.github.hulang1024.chinesechess.client.message.server.lobby.SearchRoomsResult;
import io.github.hulang1024.chinesechess.client.message.server.room.Enter;

public class ServerMessageFactory {
    private static Map<String, Class<?>> messageTypeClassMap = new HashMap<String, Class<?>>(){{
      put("lobby.search_rooms", SearchRoomsResult.class);
      put("room.create", RoomCreateResult.class);
      put("room.enter", Enter.class);
    }};

    public static Class<?> getMessageClassByType(String type) {
        return messageTypeClassMap.get(type);
    }
}