package io.github.hulang1024.chinesechess.user;

import io.github.hulang1024.chinesechess.friend.FriendRelation;
import io.github.hulang1024.chinesechess.friend.FriendsManager;
import io.github.hulang1024.chinesechess.user.activity.UserActivity;
import io.github.hulang1024.chinesechess.user.activity.UserActivityService;
import io.github.hulang1024.chinesechess.user.ws.OnlineStatServerMsg;
import io.github.hulang1024.chinesechess.user.ws.UserOfflineServerMsg;
import io.github.hulang1024.chinesechess.user.ws.UserOnlineServerMsg;
import io.github.hulang1024.chinesechess.user.ws.UserStatusChangedServerMsg;
import io.github.hulang1024.chinesechess.ws.ServerMessage;
import io.github.hulang1024.chinesechess.ws.WSMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
        broadcastUserOnlineStatus(user, true);
        sendOnlineStat();
    }

    public void onOffline(User user) {
        broadcastUserOnlineStatus(user, false);
        sendOnlineStat();
    }

    public void sendOnlineStat() {
        userActivityService.broadcast(
            UserActivity.VIEW_ONLINE_USER,
            new OnlineStatServerMsg(UserSessionManager.onlineUserCount));
    }

    private void broadcastUserOnlineStatus(User user, boolean isOnline) {
        List<FriendRelation> belongFriendRelations = friendsManager.findBelongFriendRelations(user);

        // 给该用户属于其好友的用户通知
        final ServerMessage onlineMsg = isOnline ? new UserOnlineServerMsg(user) : new UserOfflineServerMsg(user);
        belongFriendRelations.forEach(relation -> {
            if (userManager.isOnline(relation.getUserId())) {
                wsMessageService.send(onlineMsg, userManager.getLoggedInUser(relation.getUserId()));
            }
        });

        SearchUserInfo userInfo = new SearchUserInfo(user);
        userInfo.setIsOnline(isOnline);
        userInfo.setLoginDeviceOS(userManager.getUserDeviceInfo(user).getDeviceOS());

        userActivityService.broadcast(
            UserActivity.VIEW_ONLINE_USER,
            new UserStatusChangedServerMsg(userInfo, isOnline ? UserStatus.ONLINE : UserStatus.OFFLINE),
            user);
    }

}
