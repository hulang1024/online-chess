package io.github.hulang1024.chinesechess.client.message.server.lobby;

import java.util.List;

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
     * 房间玩家信息
     */
    private List<LobbyRoomPlayerInfo> players;

    /**
     * 房间玩家信息
     */
    @Data
    public class LobbyRoomPlayerInfo {
        /**
         * 玩家昵称
         */
        private String nickname;

        /**
         * 准备状态：0=未准备，1=已准备
         */
        private int readyState;
    }
}