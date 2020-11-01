package io.github.hulang1024.chinesechessserver.domain;

import org.yeauty.pojo.Session;

import lombok.Getter;
import lombok.Setter;

/**
 * 玩家
 * @author HuLang
 */
public class Player {
    @Setter
    @Getter
    private Session session;

    @Setter
    @Getter
    private String nickname;
    /**
     * 已加入的房间
     */
    private Room joinedRoom;
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
        return Long.parseLong(session.id().asShortText(), 16);
    }
}
