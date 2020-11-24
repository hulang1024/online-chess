package io.github.hulang1024.chinesechess.room;

import com.alibaba.fastjson.annotation.JSONField;
import io.github.hulang1024.chinesechess.chat.Channel;
import io.github.hulang1024.chinesechess.play.Game;
import io.github.hulang1024.chinesechess.play.UserGameState;
import io.github.hulang1024.chinesechess.play.rule.ChessHost;
import io.github.hulang1024.chinesechess.user.User;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Data
public class Room {
    private Long id;

    private String name;

    @JSONField(serialize = false)
    private String password;

    private Long createBy;

    private Long channelId;

    private LocalDateTime createAt;

    @JSONField(serialize = false)
    private LocalDateTime updateAt;

    @JSONField(serialize = false)
    private Game game;

    private User owner;

    @JSONField(serialize = false)
    private Channel channel;

    private User redChessUser;

    private UserGameState redGameState;

    private User blackChessUser;

    private UserGameState blackGameState;

    @JSONField(serialize = false)
    private List<User> spectators = new ArrayList<>();

    @JSONField(serialize = false)
    private RoomStatus status = RoomStatus.OPEN;

    /**
     * 房间内所有用户都离线则记录房间离线时间，否则为null
     */
    @JSONField(serialize = false)
    private LocalDateTime offlineAt;

    private int roundCount = 0;

    public Room() {
        game = new Game(this);
    }

    public void joinUser(User user) {
        UserGameState joinUserGameState = null;
        if (redChessUser == null) {
            redChessUser = user;
            redGameState = new UserGameState();
            joinUserGameState = redGameState;
        } else if (blackChessUser == null) {
            blackChessUser = user;
            blackGameState = new UserGameState();
            joinUserGameState = blackGameState;
        }
        if (getUserCount() == 1) {
            joinUserGameState.setReadied(true);
        } else if (getUserCount() == 2) {
            joinUserGameState.setReadied(false);
        }

        channel.joinUser(user);

        status = getUserCount() < 2 ? RoomStatus.OPEN : RoomStatus.BEGINNING;
        offlineAt = null;
    }

    public void partUser(User user) {
        channel.removeUser(user);
        status = RoomStatus.OPEN;

        if (getChessHost(user) == ChessHost.RED) {
            redChessUser = null;
            redGameState = null;
        }
        if (getChessHost(user) == ChessHost.BLACK) {
            blackChessUser = null;
            blackGameState = null;
        }

        roundCount = 0;
    }

    public ChessHost getChessHost(User user) {
        if (user.equals(this.redChessUser)) {
            return ChessHost.RED;
        }
        if (user.equals(this.blackChessUser)) {
            return ChessHost.BLACK;
        }
        return null;
    }

    public UserGameState getUserGameState(User user) {
        if (user.equals(redChessUser)) {
            return redGameState;
        }
        if (user.equals(blackChessUser)) {
            return blackGameState;
        }
        return null;
    }

    @JSONField(serialize = false)
    public int getOnlineUserCount() {
        int count = 0;
        if (this.redChessUser != null && redGameState.isOnline()) {
            count++;
        }
        if (this.blackChessUser != null && blackGameState.isOnline()) {
            count++;
        }
        return count;
    }

    public boolean isFull() {
        return getUserCount() == 2;
    }

    public int getUserCount() {
        int count = 0;
        if (this.redChessUser != null) {
            count++;
        }
        if (this.blackChessUser != null) {
            count++;
        }
        return count;
    }

    public User getOneUser() {
        if (this.redChessUser != null) {
            return this.redChessUser;
        }
        if (this.blackChessUser != null) {
            return this.blackChessUser;
        }
        return null;
    }

    public List<User> getUsers() {
        List<User> users = new ArrayList<>();
        if (redChessUser != null) {
            users.add(redChessUser);
        }
        if (blackChessUser != null) {
            users.add(blackChessUser);
        }
        return users;
    }

    public int getSpectatorCount() {
        return spectators.size();
    }

    public boolean isLocked() {
        return password != null;
    }

    public void setChannel(Channel channel) {
        this.channel = channel;
        this.channelId = channel.getId();
    }

    @JSONField(name = "status")
    public int getStatusCode() {
        return status.getCode();
    }
}
