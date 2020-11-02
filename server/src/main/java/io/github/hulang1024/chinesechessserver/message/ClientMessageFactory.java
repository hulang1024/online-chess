package io.github.hulang1024.chinesechessserver.message;

import java.util.HashMap;
import java.util.Map;

import io.github.hulang1024.chinesechessserver.message.client.chessplay.ChessMove;
import io.github.hulang1024.chinesechessserver.message.client.chessplay.ChessPlayReady;
import io.github.hulang1024.chinesechessserver.message.client.lobby.QuickMatch;
import io.github.hulang1024.chinesechessserver.message.client.lobby.SearchRooms;
import io.github.hulang1024.chinesechessserver.message.client.room.RoomCreate;
import io.github.hulang1024.chinesechessserver.message.client.room.RoomJoin;
import io.github.hulang1024.chinesechessserver.message.client.room.RoomLeave;
import io.github.hulang1024.chinesechessserver.message.client.chessplay.ChessEat;

public class ClientMessageFactory {
    private static Map<String, Class<?>> messageTypeClassMap = new HashMap<String, Class<?>>(){{
      put("lobby.search_rooms", SearchRooms.class);
      put("lobby.quick_match", QuickMatch.class);
      put("room.create", RoomCreate.class);
      put("room.join", RoomJoin.class);
      put("room.leave", RoomLeave.class);
      put("chessplay.ready", ChessPlayReady.class);
      put("chessplay.chess_move", ChessMove.class);
      put("chessplay.chess_eat", ChessEat.class);
    }};

    public static Class<?> getMessageClassByType(String type) {
        return messageTypeClassMap.get(type);
    }
}
