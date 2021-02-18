package io.github.hulang1024.chess.user.activity;

import io.github.hulang1024.chess.user.UserSessionManager;
import io.github.hulang1024.chess.user.ws.OnlineStatServerMsg;
import io.github.hulang1024.chess.user.ws.UserEnterActivityMsg;
import io.github.hulang1024.chess.user.ws.UserExitActivityMsg;
import io.github.hulang1024.chess.ws.AbstractMessageListener;
import io.github.hulang1024.chess.ws.WSMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class UserActivityMessageListener extends AbstractMessageListener {
    @Autowired
    private UserActivityService userActivityService;
    @Autowired
    private WSMessageService wsMessageService;

    @Override
    public void init() {
        addMessageHandler(UserEnterActivityMsg.class, (msg) -> {
            UserActivity userActivity = UserActivity.from(msg.getCode());
            userActivityService.enter(msg.getUser(), userActivity);

            if (userActivity == UserActivity.VIEW_ONLINE_USER) {
                wsMessageService.send(
                    new OnlineStatServerMsg(
                        UserSessionManager.onlineUserCount,
                        UserSessionManager.guestCount),
                    msg.getUser());
            }
        });

        addMessageHandler(UserExitActivityMsg.class, (msg) -> {
            userActivityService.exit(msg.getUser(), UserActivity.from(msg.getCode()));
        });
    }
}