package io.github.hulang1024.chinesechess.user;

import io.github.hulang1024.chinesechess.chat.ChannelManager;
import io.github.hulang1024.chinesechess.room.LobbyService;
import io.github.hulang1024.chinesechess.room.Room;
import io.github.hulang1024.chinesechess.room.RoomManager;
import io.github.hulang1024.chinesechess.spectator.SpectatorManager;
import io.github.hulang1024.chinesechess.user.login.UserLoginClientMsg;
import io.github.hulang1024.chinesechess.websocket.ClientSessionEventManager;
import io.github.hulang1024.chinesechess.websocket.message.AbstractMessageListener;
import io.github.hulang1024.chinesechess.websocket.message.server.stat.OnlineStatServerMsg;
import io.github.hulang1024.chinesechess.websocket.message.server.user.UserLoginServerMsg;
import io.github.hulang1024.chinesechess.websocket.message.server.user.UserOfflineServerMsg;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.yeauty.pojo.Session;

@Component
public class UserMessageListener extends AbstractMessageListener {
    @Autowired
    private LobbyService lobbyService;
    @Autowired
    private ChannelManager channelManager;
    @Autowired
    private UserManager userManager;
    @Autowired
    private RoomManager roomManager;
    @Autowired
    private SpectatorManager spectatorManager;

    public static int sessionUserCount = 0;

    @Override
    public void init() {
        ClientSessionEventManager.addSessionCloseEventHandler(this::onSessionClose);
        ClientSessionEventManager.addSessionOpenEventHandler(this::onSessionOpen);
        addMessageHandler(UserLoginClientMsg.class, this::onUserLogin);

    }

    private void onSessionOpen(Session session) {
        sessionUserCount++;
    }

    private void onUserLogin(UserLoginClientMsg loginMsg) {
        UserLoginServerMsg loginResult = new UserLoginServerMsg();

        if (loginMsg.getUserId() == -1) {
            // 现在游客登录
            GuestUser guestUser = new GuestUser();
            userSessionManager.setBinding(guestUser, loginMsg.getSession());
            userManager.loginGuestUser(guestUser);
            for (long channelId : ChannelManager.defaultChannelIds) {
                channelManager.joinChannel(channelManager.getChannelById(channelId), guestUser);
            }
        } else {
            // 现在用户登录
            // 如果该session游客登录过
            User guestUser = userManager.getGuestUser(loginMsg.getSession());
            if (guestUser != null) {
                userSessionManager.removeBinding(loginMsg.getSession());
                userManager.removeGuestUser(guestUser);
                for (long channelId : ChannelManager.defaultChannelIds) {
                    channelManager.getChannelById(channelId).removeUser(guestUser);
                }
            }

            User user = userManager.getOnlineUser(loginMsg.getUserId());
            if (user != null) {
                if (userSessionManager.getSession(user) == null ||
                    userSessionManager.getSession(user).equals(loginMsg.getSession())) {
                    boolean isOk = userSessionManager.setBinding(user, loginMsg.getSession());

                    if (isOk) {
                        for (long channelId : ChannelManager.defaultChannelIds) {
                            channelManager.joinChannel(channelManager.getChannelById(channelId), user);
                        }
                    }

                    loginResult.setCode(isOk ? 0 : 1);
                } else {
                    // 此用户已经(可能在别处)登陆
                    loginResult.setCode(2);
                }
            }
        }

        send(loginResult, loginMsg.getSession());
    }

    private void onSessionClose(Session session) {
        User user = userManager.getOnlineUser(session);
        if (user != null) {
            // 离开房间
            Room room = roomManager.getJoinedRoom(user);
            if (room != null) {
                // 发送用户离线消息
                UserOfflineServerMsg userOfflineMsg = new UserOfflineServerMsg();
                userOfflineMsg.setUid(user.getId());
                userOfflineMsg.setNickname(user.getNickname());
                roomManager.broadcast(room, userOfflineMsg, user);

                roomManager.part(room, user);
            }

            // 离开观看
            room = spectatorManager.getSpectatingRoom(user);
            if (room != null) {
                spectatorManager.leave(user, room);
            }
        } else {
            // 游客退出
            User guestUser = userManager.getGuestUser(session);
            if (guestUser != null) {
                userManager.removeGuestUser(guestUser);
            }
            user = guestUser;
        }

        if (user != null) {
            for (long channelId : ChannelManager.defaultChannelIds) {
                channelManager.getChannelById(channelId).removeUser(user);
            }
        }

        userSessionManager.removeBinding(session);

        lobbyService.removeStayLobbySession(session);

        sessionUserCount--;

        // 发送统计消息
        sendUpdateStat();
    }

    private void sendUpdateStat() {
        OnlineStatServerMsg statMsg = new OnlineStatServerMsg();
        statMsg.setOnline(sessionUserCount);
        
        lobbyService.broadcast(statMsg, null);
    }
}
