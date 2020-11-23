package io.github.hulang1024.chinesechess.user;

import io.github.hulang1024.chinesechess.chat.ChannelManager;
import io.github.hulang1024.chinesechess.room.LobbyService;
import io.github.hulang1024.chinesechess.room.Room;
import io.github.hulang1024.chinesechess.room.RoomManager;
import io.github.hulang1024.chinesechess.room.RoomStatus;
import io.github.hulang1024.chinesechess.spectator.SpectatorManager;
import io.github.hulang1024.chinesechess.user.login.UserLoginClientMsg;
import io.github.hulang1024.chinesechess.websocket.ClientSessionEventManager;
import io.github.hulang1024.chinesechess.websocket.message.AbstractMessageListener;
import io.github.hulang1024.chinesechess.websocket.message.server.play.GamePlayStatesServerMsg;
import io.github.hulang1024.chinesechess.websocket.message.server.stat.OnlineStatServerMsg;
import io.github.hulang1024.chinesechess.websocket.message.server.user.UserLoginServerMsg;
import io.github.hulang1024.chinesechess.websocket.message.server.user.UserOfflineServerMsg;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.yeauty.pojo.Session;

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
        UserLoginServerMsg loginResult = new UserLoginServerMsg();

        if (loginMsg.getUserId() < 0) {
            // 现在游客登录
            userManager.guestLogin(loginMsg.getSession());
        } else {
            // 现在用户登录
            // 如果该session游客登录过
            GuestUser guestUser = userManager.getGuestUser(loginMsg.getSession());
            if (guestUser != null) {
                userManager.guestLogout(loginMsg.getSession(), guestUser);
            }

            User user = userManager.getLoggedInUser(loginMsg.getUserId());
            if (user != null) {
                // 别处登录过
                Session otherSession = userSessionManager.getSession(user);
                if (otherSession != null) {
                    userSessionManager.removeBinding(otherSession);
                    userManager.guestLogin(otherSession);
                    UserLoginServerMsg serverMsg = new UserLoginServerMsg();
                    serverMsg.setCode(2);
                    send(serverMsg, otherSession);
                }

                // 绑定新session
                boolean isOk = userSessionManager.setBinding(user, loginMsg.getSession());
                if (isOk) {
                    Room recentJoinedRoom = roomManager.getJoinedRoom(user);
                    if (recentJoinedRoom != null && !recentJoinedRoom.getUserGameState(user).isOnline()) {
                        // 最近在游戏中掉线过，现在尝试继续
                        onBackContinuePlay(user, recentJoinedRoom);
                    } else {
                        channelManager.joinDefaultChannels(user);
                    }
                }

                loginResult.setCode(isOk ? 0 : 1);
            } else {
                loginResult.setCode(3);
            }
        }

        send(loginResult, loginMsg.getSession());
    }

    private void onSessionClose(Session session) {
        User user = userManager.getLoggedInUser(session);
        if (user != null) {
            // 如果之前加入了房间
            Room joinedRoom = roomManager.getJoinedRoom(user);
            if (joinedRoom != null) {
                if (joinedRoom.getStatus() == RoomStatus.PLAYING) {
                    // 之前正在游戏中，现在是非常规离线，记录离线状态
                    joinedRoom.getUserGameState(user).setOnline(false);
                } else {
                    roomManager.partRoom(joinedRoom, user);
                    channelManager.leaveDefaultChannels(user);
                }

                UserOfflineServerMsg userOfflineMsg = new UserOfflineServerMsg();
                userOfflineMsg.setUid(user.getId());
                if (joinedRoom.getOnlineUserCount() > 0) {
                    // 发送用户离线消息
                    roomManager.broadcast(joinedRoom, userOfflineMsg, user);
                } else {
                    spectatorManager.broadcast(joinedRoom, userOfflineMsg);
                }
            } else {
                // 如果之前旁观，现在离开观看
                Room spectatingRoom = spectatorManager.getSpectatingRoom(user);
                if (spectatingRoom != null) {
                    spectatorManager.leaveRoom(user, spectatingRoom);
                    channelManager.leaveDefaultChannels(user);
                }
            }
            userSessionManager.removeBinding(session);
        } else {
            // 游客退出
            GuestUser guestUser = userManager.getGuestUser(session);
            if (guestUser != null) {
                userManager.guestLogout(session, guestUser);
            }
        }

        userSessionManager.removeBinding(session);

        lobbyService.removeStayLobbySession(session);

        sessionUserCount--;

        sendUpdateStat();
    }

    private void onBackContinuePlay(User user, Room room) {
        GamePlayStatesServerMsg gamePlayStatesServerMsg = new GamePlayStatesServerMsg();
        gamePlayStatesServerMsg.setStates(room.getGame().buildGamePlayStatesResponse());
        room.getUserGameState(user).setOnline(true);
        send(gamePlayStatesServerMsg, user);
    }

    private void sendUpdateStat() {
        OnlineStatServerMsg statMsg = new OnlineStatServerMsg();
        statMsg.setOnline(sessionUserCount);
        
        lobbyService.broadcast(statMsg);
    }
}
