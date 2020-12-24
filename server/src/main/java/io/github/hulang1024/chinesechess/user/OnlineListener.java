package io.github.hulang1024.chinesechess.user;

import io.github.hulang1024.chinesechess.friend.FriendsManager;
import io.github.hulang1024.chinesechess.user.activity.UserActivity;
import io.github.hulang1024.chinesechess.user.activity.UserActivityService;
import io.github.hulang1024.chinesechess.user.ws.OnlineStatServerMsg;
import io.github.hulang1024.chinesechess.user.ws.UserOfflineServerMsg;
import io.github.hulang1024.chinesechess.user.ws.UserOnlineServerMsg;
import io.github.hulang1024.chinesechess.user.ws.UserStatusChangedServerMsg;
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
        broadcastUserOnlineStatus(user, true);
        sendOnlineStat();
    }

    public void onOffline(User user) {
        // 给该用户属于其好友的用户通知
        friendsManager.getBelongFriendIds(user).forEach(userId -> {
            if (userManager.isOnline(userId)) {
                wsMessageService.send(new UserOfflineServerMsg(user), userManager.getLoggedInUser(userId));
            }
        });
        broadcastUserOnlineStatus(user, false);
        sendOnlineStat();
    }


    public void sendOnlineStat() {
        userActivityService.broadcast(
            UserActivity.VIEW_ONLINE_USER,
            new OnlineStatServerMsg(UserSessionManager.onlineUserCount));
    }

    private void broadcastUserOnlineStatus(User user, boolean isOnline) {
        SearchUserInfo searchUserInfo = new SearchUserInfo(user);
        searchUserInfo.setLoginDeviceOS(userManager.getUserDeviceInfo(user).getDeviceOS());
        userActivityService.broadcast(
            UserActivity.VIEW_ONLINE_USER,
            new UserStatusChangedServerMsg(searchUserInfo,
                isOnline ? UserStatus.ONLINE : UserStatus.OFFLINE));
    }

}
