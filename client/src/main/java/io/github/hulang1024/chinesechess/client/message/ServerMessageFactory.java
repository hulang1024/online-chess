package io.github.hulang1024.chinesechess.client.message;

import java.util.Map;
import java.util.HashMap;

import io.github.hulang1024.chinesechess.client.message.server.chessplay.ChessEatResult;
import io.github.hulang1024.chinesechess.client.message.server.chessplay.ChessMoveResult;
import io.github.hulang1024.chinesechess.client.message.server.chessplay.ChessPlayReadyResult;
import io.github.hulang1024.chinesechess.client.message.server.room.RoomCreateResult;
import io.github.hulang1024.chinesechess.client.message.server.lobby.QuickMatchResult;
import io.github.hulang1024.chinesechess.client.message.server.lobby.SearchRoomsResult;
import io.github.hulang1024.chinesechess.client.message.server.room.RoomJoinResult;
import io.github.hulang1024.chinesechess.client.message.server.room.RoomLeaveResult;
import io.github.hulang1024.chinesechess.client.message.server.chessplay.ChessPlayRoundStart;

public class ServerMessageFactory {
    private static Map<String, Class<?>> messageTypeClassMap = new HashMap<String, Class<?>>(){{
        put("lobby.search_rooms", SearchRoomsResult.class);
        put("lobby.quick_match", QuickMatchResult.class);
        put("room.create", RoomCreateResult.class);
        put("room.join", RoomJoinResult.class);
        put("room.leave", RoomLeaveResult.class);
        put("chessplay.ready", ChessPlayReadyResult.class);
        put("chessplay.round_start", ChessPlayRoundStart.class);
        put("chessplay.chess_move", ChessMoveResult.class);
        put("chessplay.chess_eat", ChessEatResult.class);
    }};

    public static Class<?> getMessageClassByType(String type) {
        return messageTypeClassMap.get(type);
    }
}