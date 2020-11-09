package io.github.hulang1024.chinesechessserver.message.server.room;

import lombok.Data;

/**
 * 房间用户信息
 */
@Data
public class RoomUserInfo {
    private long id;
    
    /**
     * 用户昵称
     */
    private String nickname;

    private int chessHost;

    /**
     * 准备状态
     */
    private boolean readyed;
}