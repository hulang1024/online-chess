package io.github.hulang1024.chinesechess.user.ws;

import com.alibaba.fastjson.annotation.JSONField;
import io.github.hulang1024.chinesechess.user.SearchUserInfo;
import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.user.UserStatus;
import io.github.hulang1024.chinesechess.ws.ServerMessage;
import lombok.Data;

@Data
public class UserStatusChangedServerMsg extends ServerMessage {
    private long uid;
    private SearchUserInfo user;
    @JSONField(serialize = false)
    private UserStatus status;

    public UserStatusChangedServerMsg(User user, UserStatus status) {
        super("user.status_changed");
        this.uid = user.getId();
        this.user = new SearchUserInfo();
        this.user.setId(user.getId());
        this.user.setNickname(user.getNickname());
        this.user.setAvatarUrl(user.getAvatarUrl());
        this.user.setStatus(status);
        this.status = status;
    }

    @JSONField(name = "status")
    public int getStatusCode() {
        return status.getCode();
    }
}
