package io.github.hulang1024.chinesechess.message.server.lobby;

import java.util.List;

import io.github.hulang1024.chinesechess.message.ServerMessage;
import io.github.hulang1024.chinesechess.message.server.MessageType;
import lombok.Data;

/**
 * 搜索房间结果
 */
@Data
@MessageType("lobby.search_rooms")
public class SearchRoomsResult extends ServerMessage {
    /**
     * 房间列表
     */
    private List<LobbyRoom> rooms;
}
