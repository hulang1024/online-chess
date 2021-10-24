package io.github.hulang1024.chess.games;

import com.alibaba.fastjson.annotation.JSONField;
import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.user.UserManager;
import io.github.hulang1024.chess.user.UserStatus;
import lombok.Data;

@Data
public class GameUser {
    private User user;
    private boolean isReady;

    private int chess;

    private GameTimer timer;

    private boolean isRoomOwner;

    @JSONField(serialize = false)
    public UserManager userManager;

    public boolean isOnline() {
        return user != null ? userManager.isOnline(user) : false;
    }

    @JSONField(serialize = false)
    public UserStatus getStatus() {
        return user != null ? userManager.getUserStatus(user) : null;
    }

    @JSONField(name = "status")
    public Integer getStatusCode() {
        UserStatus status = getStatus();
        return status != null ? status.getCode() : null;
    }
}