package io.github.hulang1024.chinesechessserver.room;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.github.hulang1024.chinesechessserver.chat.Channel;
import io.github.hulang1024.chinesechessserver.play.GamePlay;
import io.github.hulang1024.chinesechessserver.service.SessionUser;
import io.github.hulang1024.chinesechessserver.user.User;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotNull;

@Data
public class Room {
    private Long id;

    private String name;

    @JsonIgnore
    private String password;

    private Long createBy;

    private Long channelId;

    @JsonIgnore
    private String userIds;

    private LocalDateTime createAt;

    private LocalDateTime updateAt;

    @JsonIgnore
    private GamePlay round;

    @JsonIgnore
    private SessionUser owner;

    @JsonIgnore
    private Channel channel;

    /**
     * 参与者
     */ 
    private List<SessionUser> users1 = new ArrayList<>();

    private List<User> users = new ArrayList<>();
    /**
     * 观众
     */
    @Getter
    private List<SessionUser> spectators = new ArrayList<>();

    public void onJoin(SessionUser user) {
        channel.joinUser(user);
        users1.add(user);
    }

    public void joinUser(User user) {
        channel.joinUser(user);
        users.add(user);
    }

    public void onLeave(SessionUser user) {
        channel.removeUser(user);
        users1.remove(user);
    }

    public int getUserCount() {
        return users1.size();
    }

    public List<SessionUser> getUsers1() {
        return users1;
    }

    public boolean isLocked() {
        return password != null;
    }

    public int calcStatus() {
        int status;

        int userNum = users1.size();
        if (userNum < 2) {
            // 未满员
            status = 1;
        } else if (userNum == 2 && users1.stream().anyMatch(user -> !user.isReadyed())) {
            // 未开始（即将开始）
            status = 2;
        } else {
            // 进行中
            status = 3;
        }

        return status;
    }
}
