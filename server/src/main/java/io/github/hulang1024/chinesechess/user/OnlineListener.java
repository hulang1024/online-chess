package io.github.hulang1024.chinesechess.user;

import io.github.hulang1024.chinesechess.friend.FriendsManager;
import io.github.hulang1024.chinesechess.user.ws.OnlineStatServerMsg;
import io.github.hulang1024.chinesechess.user.ws.UserOfflineServerMsg;
import io.github.hulang1024.chinesechess.user.ws.UserOnlineServerMsg;
import io.github.hulang1024.chinesechess.ws.WSMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OnlineListener {
    @Autowired
    private UserManager userManager;
    @Autowired
    private FriendsManager friendsManager;
    @Autowired
    protected WSMessageService wsMessageService;
    @Autowired
    private UserActivityService userActivityService;

    public void onOnline(User user) {
        // 给该用户属于其好友的用户通知
        friendsManager.getBelongFriendIds(user).forEach(userId -> {
            if (userManager.isOnline(userId)) {
                wsMessageService.send(new UserOnlineServerMsg(user), userManager.getLoggedInUser(userId));
            }
        });

        sendOnlineStat();
    }

    public void onOffline(User user) {
        // 给该用户属于其好友的用户通知
        friendsManager.getBelongFriendIds(user).forEach(userId -> {
            if (userManager.isOnline(userId)) {
                wsMessageService.send(new UserOfflineServerMsg(user), userManager.getLoggedInUser(userId));
            }
        });

        sendOnlineStat();
    }


    public void sendOnlineStat() {
        userActivityService.broadcast(
            UserActivity.ONLINE_USER,
            new OnlineStatServerMsg(UserSessionManager.onlineUserCount));
    }

}
