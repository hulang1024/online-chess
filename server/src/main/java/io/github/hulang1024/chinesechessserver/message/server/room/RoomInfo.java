package io.github.hulang1024.chinesechessserver.message.server.room;

import java.util.List;

import lombok.Data;

/**
 * 房间
 */
@Data
public class RoomInfo {
    /**
     * 房间id
     */
    private long id;
    /**
     * 房间名称
     */
    private String name;
    /**
     * 用户数量
     */
    private int userCount;

    /**
     * 有密码
     */
    private boolean locked;

    private long ownerUserId;

    private long chatChannelId;

    /**
     * 房间用户信息
     */
    private List<RoomUserInfo> users;

    private int spectatorCount;

    private List<RoomUserInfo> spectators;

    private int status;
}