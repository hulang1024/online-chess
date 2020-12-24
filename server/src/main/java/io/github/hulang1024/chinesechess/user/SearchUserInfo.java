package io.github.hulang1024.chinesechess.user;

import com.alibaba.fastjson.annotation.JSONField;
import io.github.hulang1024.chinesechess.userstats.UserStats;
import lombok.Data;

@Data
public class SearchUserInfo extends User {
    private Boolean isOnline;
    private Boolean isFriend;
    private Boolean isMutual;
    private UserStats userStats;
    @JSONField(serialize = false)
    private UserStatus status;

    private String loginDeviceOS;

    public SearchUserInfo(User user) {
        setId(user.getId());
        setNickname(user.getNickname());
        setAvatarUrl(user.getAvatarUrl());
    }

    @JSONField(name = "status")
    public int getStatusCode() {
        return status == null ? -1 : status.getCode();
    }
}
