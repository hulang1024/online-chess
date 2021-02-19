package io.github.hulang1024.chess.room;

import com.alibaba.fastjson.annotation.JSONField;
import io.github.hulang1024.chess.chat.Channel;
import io.github.hulang1024.chess.chat.ChannelManager;
import io.github.hulang1024.chess.games.Game;
import io.github.hulang1024.chess.games.GameType;
import io.github.hulang1024.chess.games.GameUser;
import io.github.hulang1024.chess.games.chess.ChessHost;
import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.user.UserManager;
import lombok.Data;
import org.apache.commons.lang3.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


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
    private GameType gameType;

    @JSONField(serialize = false)
    private Game game;

    @JSONField(serialize = false)
    private User owner;

    @JSONField(serialize = false)
    private Channel channel;

    private List<GameUser> gameUsers = new ArrayList<>();

    @JSONField(serialize = false)
    private List<User> spectators = new ArrayList<>();

    @JSONField(serialize = false)
    private RoomStatus status = RoomStatus.OPEN;

    @JSONField(serialize = false)
    private ChannelManager channelManager;

    @JSONField(serialize = false)
    private UserManager userManager;

    /**
     * 房间内所有用户都离线则记录房间离线时间，否则为null
     */
    private LocalDateTime offlineAt;

    private int gameCount = 0;

    private RoomSettings roomSettings;

    public Room(ChannelManager channelManager, UserManager userManager) {
        this.channelManager = channelManager;
        this.userManager = userManager;
    }

    public void joinUser(User user) {
        GameUser joinedUser = new GameUser();
        joinedUser.setUserManager(userManager);
        joinedUser.setUser(user);
        joinedUser.setReady(user.equals(owner));
        joinedUser.setRoomOwner(user.equals(owner));

        joinedUser.setChess(getUserCount() == 0 ? ChessHost.FIRST : ChessHost.SECOND);
        gameUsers.add(joinedUser);

        channelManager.joinChannel(channel, user);

        status = getUserCount() < 2 ? RoomStatus.OPEN : RoomStatus.BEGINNING;
    }

    public void partUser(User user) {
        channelManager.leaveChannel(channel, user);
        status = RoomStatus.OPEN;

        getGameUser(user).ifPresent((leftUser) -> {
            gameUsers.remove(getGameUser(user).get());
            leftUser.setUser(null);
            leftUser.setReady(false);
        });

        if (game != null) {
            game.over();
            game = null;
        }
    }

    public void setChannel(Channel channel) {
        this.channel = channel;
        this.channelId = channel.getId();
    }

    @JSONField(serialize = false)
    public int getOnlineUserCount() {
        return (int)gameUsers.stream().filter((u) -> u.getUser() != null && u.isOnline()).count();
    }

    @JSONField(serialize = false)
    public boolean isFull() {
        return getUserCount() == 2;
    }

    @JSONField(serialize = false)
    public int getUserCount() {
        return gameUsers.size();
    }

    @JSONField(serialize = false)
    public Optional<GameUser> getGameUser(User user) {
        return gameUsers.stream()
            .filter((u) -> u.getUser().equals(user))
            .findAny();
    }

    @JSONField(serialize = false)
    public GameUser getOtherUser(User user) {
        return gameUsers.stream()
            .filter((u) -> !u.getUser().equals(user))
            .findFirst().get();
    }

    public int getSpectatorCount() {
        return spectators.size();
    }

    public boolean isLocked() {
        return StringUtils.isNotBlank(password);
    }

    @JSONField(name = "gameType")
    public int getGameTypeCode() {
        return gameType.getCode();
    }

    @JSONField(name = "status")
    public int getStatusCode() {
        return status.getCode();
    }

    @JSONField(name = "gameStatus")
    public int getGameStateCode() {
        return game == null ? 0 : game.getState().getCode();
    }
}