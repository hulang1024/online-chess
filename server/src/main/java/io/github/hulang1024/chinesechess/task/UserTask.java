package io.github.hulang1024.chinesechess.task;

import io.github.hulang1024.chinesechess.user.UserManager;
import io.github.hulang1024.chinesechess.user.UserSessionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class UserTask {
    @Autowired
    private UserManager userManager;
    @Autowired
    private UserSessionManager userSessionManager;

    /**
     * 每日晚上0点处理WebSocket断开但API未退出的用户
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void handleOfflineUsers() {
        userManager.getLoggedInUsers().forEach((user) -> {
            if (!userSessionManager.isConnected(user)) {
                userManager.logoutAPI(user);
            }
        });
    }
}