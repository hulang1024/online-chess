package io.github.hulang1024.chess.user;

import io.github.hulang1024.chess.friend.FriendsManager;
import io.github.hulang1024.chess.user.activity.UserActivity;
import io.github.hulang1024.chess.user.activity.UserActivityService;
import io.github.hulang1024.chess.user.ws.OnlineStatServerMsg;
import io.github.hulang1024.chess.user.ws.UserOfflineServerMsg;
import io.github.hulang1024.chess.user.ws.UserOnlineServerMsg;
import io.github.hulang1024.chess.user.ws.UserStatusChangedServerMsg;
import io.github.hulang1024.chess.ws.ServerMessage;
import io.github.hulang1024.chess.ws.WSMessageService;
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
        countOnline(user, true);
        sendOnlineStat();
        broadcastUserOnlineStatus(user, true);
    }

    public void onOffline(User user) {
        countOnline(user, false);
        sendOnlineStat();
        broadcastUserOnlineStatus(user, false);
    }

    public void sendOnlineStat() {
        userActivityService.broadcast(
            UserActivity.VIEW_ONLINE_USER,
            new OnlineStatServerMsg());
    }

    private void broadcastUserOnlineStatus(User user, boolean isOnline) {
        if (!(user instanceof GuestUser)) {
            // 给该用户属于其好友的用户通知
            final ServerMessage onlineMsg = isOnline ? new UserOnlineServerMsg(user) : new UserOfflineServerMsg(user);
            friendsManager.findBelongFriendRelations(user).forEach(relation -> {
                if (userManager.isOnline(relation.getUserId())) {
                    wsMessageService.send(onlineMsg, userManager.getLoggedInUser(relation.getUserId()));
                }
            });
        }

        SearchUserInfo userInfo = new SearchUserInfo(user);
        userInfo.setIsOnline(isOnline);
        userInfo.setUserDeviceInfo(userManager.getUserDeviceInfo(user));

        userActivityService.broadcast(
            UserActivity.VIEW_ONLINE_USER,
            new UserStatusChangedServerMsg(userInfo, isOnline ? UserStatus.ONLINE : UserStatus.OFFLINE),
            user);
    }

    private void countOnline(User user, boolean isOnline) {
        UserDeviceInfo userDeviceInfo = userManager.getUserDeviceInfo(user);
        if (userDeviceInfo == null || userDeviceInfo == UserDeviceInfo.NULL) {
            return;
        }
        int inc = isOnline ? +1 : -1;
        if (userDeviceInfo.getDevice().equals(1)) {
            UserOnlineCounter.pc += inc;
        } else {
            UserOnlineCounter.mobile += inc;
        }
    }

}