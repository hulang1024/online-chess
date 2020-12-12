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

    @JSONField(name = "status")
    public int getStatusCode() {
        return status == null ? -1 : status.getCode();
    }
}
