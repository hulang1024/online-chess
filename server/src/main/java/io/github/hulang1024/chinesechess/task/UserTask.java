package io.github.hulang1024.chinesechess.task;

import io.github.hulang1024.chinesechess.user.UserManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class UserTask {
    @Autowired
    private UserManager userManager;

    /**
     * 每日晚上0点清理Socket下线但API未退出的用户
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void handleOfflineUsers() {
        // TODO:
    }
}