package io.github.hulang1024.chinesechess.user;

import com.alibaba.fastjson.annotation.JSONField;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.github.hulang1024.chinesechess.database.entity.EntityUser;
import io.github.hulang1024.chinesechess.play.rule.ChessHost;
import io.github.hulang1024.chinesechess.room.Room;
import lombok.Data;
import org.yeauty.pojo.Session;


@Data
public class User extends EntityUser {
    @JsonIgnore
    @JSONField(serialize = false)
    private Session session;

    /**
     * 持棋方
     */
    private ChessHost chessHost;

    /**
     * 已加入的房间
     */
    @JsonIgnore
    @JSONField(serialize = false)
    private Room joinedRoom;

    /**
     * 观看的房间
     */
    @JsonIgnore
    @JSONField(serialize = false)
    private Room spectatingRoom;

    /**
     * 准备状态
     */
    private boolean readied = false;

    public static User SYSTEM_USER;
    static {
        User systemUser = new User();
        systemUser.setId(0L);
        systemUser.setNickname("系统");
        SYSTEM_USER = systemUser;
    }

    public void joinRoom(Room room) {
        joinedRoom = room;
        joinedRoom.joinUser(this);
    }

    public void partRoom() {
        if (joinedRoom == null) {
            return;
        }

        joinedRoom.partUser(this);
        joinedRoom = null;
        readied = false;
    }

    @JsonIgnore
    @JSONField(serialize = false)
    public boolean isJoinedAnyRoom() {
        return joinedRoom != null;
    }

    @JsonIgnore
    @JSONField(serialize = false)
    public boolean isSpectatingAnyRoom() {
        return spectatingRoom != null;
    }
}
