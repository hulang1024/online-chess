package io.github.hulang1024.chinesechessserver.domain;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import io.github.hulang1024.chinesechessserver.chat.ChannelType;
import io.github.hulang1024.chinesechessserver.chat.Channel;
import io.github.hulang1024.chinesechessserver.chat.ChannelManager;
import lombok.Data;
import lombok.Getter;

/**
 * 房间
 * @author HuLang
 */
@Data
public class Room {
    private long id;

    private String name;

    private RoundGame round;

    private SessionUser owner;

    private String password;
    
    private Date createAt;

    private Channel chatChannel = ChannelManager.create(ChannelType.ROOM);

    /**
     * 参与者
     */ 
    private List<SessionUser> users = new ArrayList<>();

    /**
     * 观众
     */
    @Getter
    private List<SessionUser> spectators = new ArrayList<>();

    public void onJoin(SessionUser user) {
        chatChannel.joinUser(user);
        users.add(user);
    }

    public void onLeave(SessionUser user) {
        chatChannel.removeUser(user);
        users.remove(user);
    }

    public int getUserCount() {
        return users.size();
    }

    public List<SessionUser> getUsers() {
        return users;
    }

    public boolean isLocked() {
        return password != null;
    }

    public int calcStatus() {
        int status;

        int userNum = users.size();
        if (userNum < 2) {
            // 未满员
            status = 1;
        } else if (userNum == 2 && users.stream().anyMatch(user -> !user.isReadyed())) {
            // 未开始（即将开始）
            status = 2;
        } else {
            // 进行中
            status = 3;
        }

        return status;
    }
}
