package io.github.hulang1024.chinesechessserver.message.server;

import lombok.Data;

/**
 * 房间玩家信息
 */
@Data
public class RoomPlayerInfo {
    private long id;
    
    /**
     * 玩家昵称
     */
    private String nickname;

    /**
     * 准备状态
     */
    private boolean readyed;
}