package io.github.hulang1024.chess.user;

import io.github.hulang1024.chess.userstats.UserStats;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class UserDetails extends SearchUserInfo {
    private List<UserStats> scoreStats = new ArrayList<>();

    public UserDetails(User user) {
        super(user);
    }
}