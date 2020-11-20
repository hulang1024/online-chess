package io.github.hulang1024.chinesechess.room;

import com.alibaba.fastjson.annotation.JSONField;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.github.hulang1024.chinesechess.chat.Channel;
import io.github.hulang1024.chinesechess.message.MessageUtils;
import io.github.hulang1024.chinesechess.message.ServerMessage;
import io.github.hulang1024.chinesechess.play.GamePlay;
import io.github.hulang1024.chinesechess.user.User;
import lombok.Data;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Data
public class Room {
    private Long id;

    private String name;

    @JsonIgnore
    @JSONField(serialize = false)
    private String password;

    private Long createBy;

    private Long channelId;

    private LocalDateTime createAt;

    @JsonIgnore
    @JSONField(serialize = false)

    private LocalDateTime updateAt;

    //@JsonIgnore
    //private String userIds;

    @JsonIgnore
    @JSONField(serialize = false)
    private GamePlay round;

    @JsonIgnore
    @JSONField(serialize = false)
    private User owner;

    @JsonIgnore
    @JSONField(serialize = false)
    private Channel channel;

    private List<User> users = new ArrayList<>();

    /**
     * 观众
     */
    @Getter
    private List<User> spectators = new ArrayList<>();


    public void joinUser(User user) {
        channel.joinUser(user);
        if (!users.contains(user)) {
            users.add(user);
        }
    }

    public void partUser(User user) {
        channel.removeUser(user);
        users.remove(user);
    }

    public void broadcast(ServerMessage message) {
        broadcast(message, null);
    }

    public void broadcast(ServerMessage message, User exclude) {
        this.users.forEach(user -> {
            if (user.equals(exclude)) {
                return;
            }
            MessageUtils.send(message, user.getSession());
        });
        this.spectators.forEach(user -> {
            if (user.equals(exclude)) {
                return;
            }
            MessageUtils.send(message, user.getSession());
        });
    }


    public int getUserCount() {
        return users.size();
    }

    public boolean isLocked() {
        return password != null;
    }

    public void setChannel(Channel channel) {
        this.channel = channel;
        this.channelId = channel.getId();
    }

    public int calcStatus() {
        int status;

        int userCount = users.size();
        if (userCount < 2) {
            // 未满员
            status = 1;
        } else if (userCount == 2 && users.stream().anyMatch(user -> !user.isReadied())) {
            // 未开始（即将开始）
            status = 2;
        } else {
            // 进行中
            status = 3;
        }

        return status;
    }
}
