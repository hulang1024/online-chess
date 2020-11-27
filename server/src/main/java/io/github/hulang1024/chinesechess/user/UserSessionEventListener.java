package io.github.hulang1024.chinesechess.user;

import io.github.hulang1024.chinesechess.chat.ChannelManager;
import io.github.hulang1024.chinesechess.friend.FriendsManager;
import io.github.hulang1024.chinesechess.play.GameState;
import io.github.hulang1024.chinesechess.play.ws.servermsg.GameContinueServerMsg;
import io.github.hulang1024.chinesechess.room.LobbyService;
import io.github.hulang1024.chinesechess.room.Room;
import io.github.hulang1024.chinesechess.room.RoomManager;
import io.github.hulang1024.chinesechess.spectator.SpectatorManager;
import io.github.hulang1024.chinesechess.user.login.UserLoginClientMsg;
import io.github.hulang1024.chinesechess.user.ws.OnlineStatServerMsg;
import io.github.hulang1024.chinesechess.user.ws.UserLoginServerMsg;
import io.github.hulang1024.chinesechess.user.ws.UserOfflineServerMsg;
import io.github.hulang1024.chinesechess.user.ws.UserOnlineServerMsg;
import io.github.hulang1024.chinesechess.ws.ClientSessionEventManager;
import io.github.hulang1024.chinesechess.ws.message.AbstractMessageListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.yeauty.pojo.Session;

import java.time.LocalDateTime;

@Component
public class UserSessionEventListener extends AbstractMessageListener {
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
    @Autowired
    private FriendsManager friendsManager;

    public static int sessionUserCount = 0;

    @Override
    public void init() {
        ClientSessionEventManager.addSessionCloseEventHandler(this::onSessionClose);
        ClientSessionEventManager.addSessionOpenEventHandler(this::onSessionOpen);
        addMessageHandler(UserLoginClientMsg.class, this::onWebSocketUserLogin);

    }

    private void onSessionOpen(Session session) {
        sessionUserCount++;
    }

    private void onWebSocketUserLogin(UserLoginClientMsg loginMsg) {
        // 如果是游客登录
        if (loginMsg.getUserId() < 0) {
            userManager.guestLogin(loginMsg.getSession());
            send(new UserLoginServerMsg(0), loginMsg.getSession());
            return;
        }

        // 如果该session游客登录过
        GuestUser guestUser = userManager.getGuestUser(loginMsg.getSession());
        if (guestUser != null) {
            userManager.guestLogout(loginMsg.getSession(), guestUser);
        }

        // 验证http api是否登录过
        User user = userManager.getLoggedInUser(loginMsg.getUserId());
        if (user == null) {
            send(new UserLoginServerMsg(3), loginMsg.getSession());
            return;
        }

        // 验证别处websocket登录过
        Session otherSession = userSessionManager.getSession(user);
        if (otherSession != null) {
            userSessionManager.removeBinding(otherSession);
            userManager.guestLogin(otherSession);
            send(new UserLoginServerMsg(2), otherSession);
        }

        // 绑定新session
        boolean isOk = userSessionManager.setBinding(user, loginMsg.getSession());
        if (!isOk) {
            send(new UserLoginServerMsg(1), loginMsg.getSession());
            return;
        }

        // 加入频道
        channelManager.joinDefaultChannels(user);

        // 之前进入过房间未退出
        Room joinedRoom = roomManager.getJoinedRoom(user);
        if (joinedRoom != null) {
            send(new GameContinueServerMsg(), loginMsg.getSession());
            roomManager.broadcast(joinedRoom, new UserOnlineServerMsg(user), user);
        }

        send(new UserLoginServerMsg(0), loginMsg.getSession());

        // 给该用户属于其好友的用户通知
        friendsManager.getBelongFriendIds(user).forEach(userId -> {
            if (userSessionManager.isOnline(userId)) {
                send(new UserOnlineServerMsg(user), userSessionManager.getSession(userId));
            }
        });
    }

    private void onSessionClose(Session session) {
        User user = userManager.getLoggedInUser(session);
        if (user == null) {
            // 游客退出
            GuestUser guestUser = userManager.getGuestUser(session);
            if (guestUser != null) {
                userManager.guestLogout(session, guestUser);
            }
        } else {
            // 如果加入了房间
            Room joinedRoom = roomManager.getJoinedRoom(user);
            if (joinedRoom != null) {
                switch (joinedRoom.getGame().getState()) {
                    case PLAYING:
                        // 暂停游戏
                        joinedRoom.getGame().setState(GameState.PAUSE);
                        // break;
                    case PAUSE:
                        // 如果游戏已经是暂停状态，是因为上个用户离线导致的
                        UserOfflineServerMsg userOfflineMsg = new UserOfflineServerMsg(user);
                        if (joinedRoom.getOnlineUserCount() > 0) {
                            // 房间内还有在线用户，发送离线消息
                            roomManager.broadcast(joinedRoom, userOfflineMsg, user);
                        } else {
                            // 房间内没有在线用户
                            joinedRoom.setOfflineAt(LocalDateTime.now());
                            spectatorManager.broadcast(joinedRoom, userOfflineMsg);
                        }
                        break;
                    case READY:
                        roomManager.partRoom(joinedRoom, user);
                        channelManager.leaveChannels(user);
                        break;
                }
            } else {
                // 如果之前是观众，现在离开观看
                Room spectatingRoom = spectatorManager.getSpectatingRoom(user);
                if (spectatingRoom != null) {
                    spectatorManager.leaveRoom(user, spectatingRoom);
                }
                channelManager.leaveChannels(user);
            }
        }

        userSessionManager.removeBinding(session);

        lobbyService.removeStayLobbySession(session);

        sessionUserCount--;

        sendUpdateStat();
    }


    private void sendUpdateStat() {
        OnlineStatServerMsg statMsg = new OnlineStatServerMsg();
        statMsg.setOnline(sessionUserCount);
        
        lobbyService.broadcast(statMsg);
    }
}
