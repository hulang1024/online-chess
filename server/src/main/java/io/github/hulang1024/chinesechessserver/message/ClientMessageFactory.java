package io.github.hulang1024.chinesechessserver.message;

import java.util.HashMap;
import java.util.Map;

import io.github.hulang1024.chinesechessserver.message.client.lobby.SearchRooms;
import io.github.hulang1024.chinesechessserver.message.client.room.Create;

public class ClientMessageFactory {
    private static Map<String, Class<?>> messageTypeClassMap = new HashMap<String, Class<?>>(){{
      put("lobby.search_rooms", SearchRooms.class);
      put("room.create", Create.class);
    }};

    public static Class<?> getMessageClassByType(String type) {
        return messageTypeClassMap.get(type);
    }
}
