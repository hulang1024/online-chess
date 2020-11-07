package io.github.hulang1024.chinesechessserver.message.server.lobby;

import java.util.List;

import io.github.hulang1024.chinesechessserver.message.server.player.RoomPlayerInfo;
import lombok.Data;

/**
 * 房间
 */
@Data
public class LobbyRoom {
    /**
     * 房间id
     */
    private long id;
    /**
     * 房间名称
     */
    private String name;
    /**
     * 玩家数量
     */
    private int playerCount;

    /**
     * 有密码
     */
    private boolean locked;

    /**
     * 房间玩家信息
     */
    private List<RoomPlayerInfo> players;

    private int status;
}