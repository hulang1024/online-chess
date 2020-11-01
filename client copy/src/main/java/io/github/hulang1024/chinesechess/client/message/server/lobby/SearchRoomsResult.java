package io.github.hulang1024.chinesechess.client.message.server.lobby;

import java.util.List;

import io.github.hulang1024.chinesechess.client.message.ServerMessage;
import lombok.Data;

/**
 * 搜索房间结果
 */
@Data
public class SearchRoomsResult extends ServerMessage {
    /**
     * 房间列表
     */
    private List<LobbyRoom> rooms;
}
