package io.github.hulang1024.chinesechess.user;

import io.github.hulang1024.chinesechess.ws.ServerMessage;
import io.github.hulang1024.chinesechess.ws.WSMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserActivityService {
    /**
     * 停留的user
     */
    private static Map<UserActivity, List<User>> activityUsersMap = new ConcurrentHashMap<>();

    static {
        for (UserActivity ua : UserActivity.values()) {
            activityUsersMap.put(ua, new ArrayList<>());
        }
    }

    @Autowired
    private WSMessageService wsMessageService;

    public void broadcast(UserActivity userActivity, ServerMessage message, User... excludes) {
        User exclude = excludes.length == 0 ? null : excludes[0];
        activityUsersMap.get(userActivity).forEach(user -> {
            if (user.equals(exclude)) {
                return;
            }
            wsMessageService.send(message, user);
        });
    }

    public void enter(UserActivity userActivity, User user) {
        List<User> uses = activityUsersMap.get(userActivity);
        if (!uses.contains(user)) {
            uses.add(user);
        }
    }

    public void exit(UserActivity userActivity, User user) {
        activityUsersMap.get(userActivity).remove(user);
    }

    public void exit(User user) {
        activityUsersMap.values().forEach(users -> users.remove(user));
    }
}
