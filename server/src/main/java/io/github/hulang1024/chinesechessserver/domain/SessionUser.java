package io.github.hulang1024.chinesechessserver.domain;

import org.yeauty.pojo.Session;

import io.github.hulang1024.chinesechessserver.domain.chinesechess.rule.ChessHost;
import io.github.hulang1024.chinesechessserver.entity.User;
import lombok.Getter;
import lombok.Setter;

/**
 * 用户
 * @author HuLang
 */
public class SessionUser {
    @Setter
    @Getter
    private Session session;

    @Setter
    @Getter
    private User user;

    @Setter
    @Getter
    private ChessHost chessHost;

    /**
     * 已加入的房间
     */
    private Room joinedRoom;

    private Room spectatingRoom;
    
    /**
     * 准备状态
     */
    private boolean readyed = false;

    public void joinRoom(Room room) {
        joinedRoom = room;
        joinedRoom.onJoin(this);
    }

    public void leaveRoom() {
        if (joinedRoom == null) {
            return;
        }

        joinedRoom.onLeave(this);
        joinedRoom = null;
        readyed = false;
    }

    public void setSpectatingRoom(Room room) {
        this.spectatingRoom = room;
    }

    public Room getSpectatingRoom() {
        return this.spectatingRoom;
    }

    public boolean isJoinedAnyRoom() {
        return joinedRoom != null;
    }

    public Room getJoinedRoom() {
        return joinedRoom;
    }

    public void setReadyed(boolean readyed) {
        this.readyed = readyed;
    }

    public boolean isReadyed() {
        return readyed;
    }

    public long getId() {
        return user.getId();
    }
}
