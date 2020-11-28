package io.github.hulang1024.chinesechess.user;

import io.github.hulang1024.chinesechess.userstats.UserStats;
import lombok.Data;

@Data
public class SearchUserInfo extends User {
    private Boolean isOnline;
    private Boolean isFriend;
    private Boolean isMutual;
    private UserStats userStats;
}
