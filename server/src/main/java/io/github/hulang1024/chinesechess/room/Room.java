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
    public static final int MAX_PARTICIPANTS = 2;

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

    @JSONField(serialize = false)
    private List<User> users = new ArrayList<>();

    private User redChessUser;

    private UserGameState redGameState;

    private User blackChessUser;

    private UserGameState blackGameState;

    @JSONField(serialize = false)
    private List<User> spectators = new ArrayList<>();

    @JSONField(serialize = false)
    private RoomStatus status = RoomStatus.OPEN;

    private int roundCount = 0;

    public Room() {
        game = new Game();
        redGameState = new UserGameState();
        blackGameState = new UserGameState();
    }

    public void joinUser(User user) {
        if (getUserCount() == MAX_PARTICIPANTS) {
            status = RoomStatus.BEGINNING;
        }

        UserGameState joinUserGameState = null;
        if (redChessUser == null) {
            redChessUser = user;
            joinUserGameState = redGameState;
        } else if (blackChessUser == null) {
            blackChessUser = user;
            joinUserGameState = blackGameState;
        }
        if (getUserCount() == 0) {
            joinUserGameState.setReadied(true);
        } else if (getUserCount() == 1) {
            joinUserGameState.setReadied(false);
        }

        users.add(user);

        channel.joinUser(user);

        if (getUserCount() > 1) {
            status = RoomStatus.BEGINNING;
        }
    }

    public void partUser(User user) {
        channel.removeUser(user);
        users.remove(user);
        status = RoomStatus.OPEN;

        if (getChessHost(user) == ChessHost.RED) {
            redChessUser = null;
        }
        if (getChessHost(user) == ChessHost.BLACK) {
            blackChessUser = null;
        }
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
        if (user.equals(this.redChessUser)) {
            return redGameState;
        }
        if (user.equals(this.blackChessUser)) {
            return blackGameState;
        }
        return null;
    }

    public int getUserCount() {
        return users.size();
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
