package io.github.hulang1024.chinesechess.user;

import io.github.hulang1024.chinesechess.friend.FriendsManager;
import io.github.hulang1024.chinesechess.room.LobbyService;
import io.github.hulang1024.chinesechess.user.ws.OnlineStatServerMsg;
import io.github.hulang1024.chinesechess.user.ws.UserOfflineServerMsg;
import io.github.hulang1024.chinesechess.user.ws.UserOnlineServerMsg;
import io.github.hulang1024.chinesechess.ws.message.WSMessageUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OnlineListener {
    @Autowired
    private FriendsManager friendsManager;
    @Autowired
    protected UserSessionManager userSessionManager;
    @Autowired
    private LobbyService lobbyService;

    public void onOnline(User user) {
        // 给该用户属于其好友的用户通知
        friendsManager.getBelongFriendIds(user).forEach(userId -> {
            if (userSessionManager.isOnline(userId)) {
                WSMessageUtils.send(new UserOnlineServerMsg(user), userSessionManager.getSession(userId));
            }
        });

        sendOnlineStat();
    }

    public void onOffline(User user) {
        // 给该用户属于其好友的用户通知
        friendsManager.getBelongFriendIds(user).forEach(userId -> {
            if (userSessionManager.isOnline(userId)) {
                WSMessageUtils.send(new UserOfflineServerMsg(user), userSessionManager.getSession(userId));
            }
        });

        sendOnlineStat();
    }


    private void sendOnlineStat() {
        OnlineStatServerMsg statMsg = new OnlineStatServerMsg();
        statMsg.setOnline(UserSessionManager.onlineUserCount);

        lobbyService.broadcast(statMsg);
    }

}
