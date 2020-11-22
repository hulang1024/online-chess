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
        addMessageHandler(UserLoginClientMsg.class, this::onUserLogin);

    }

    private void onSessionOpen(Session session) {
        sessionUserCount++;
    }

    private void onUserLogin(UserLoginClientMsg loginMsg) {
        UserLoginServerMsg loginResult = new UserLoginServerMsg();

        if (loginMsg.getUserId() < 0) {
            // 现在游客登录
            onGuestLogin(loginMsg);
        } else {
            // 现在用户登录
            // 如果该session游客登录过
            User guestUser = userManager.getGuestUser(loginMsg.getSession());
            if (guestUser != null) {
                onGuestLogout(loginMsg.getSession(), guestUser);
            }

            User user = userManager.getLoggedInUser(loginMsg.getUserId());
            if (user != null) {
                if (userSessionManager.getSession(user) == null ||
                    userSessionManager.getSession(user).equals(loginMsg.getSession())) {
                    // 绑定session
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
                    // 此用户已经(可能在别处)登陆
                    loginResult.setCode(2);
                }
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
            User guestUser = userManager.getGuestUser(session);
            if (guestUser != null) {
                onGuestLogout(session, guestUser);
            }
        }

        lobbyService.removeStayLobbySession(session);

        sessionUserCount--;

        // 发送统计消息
        sendUpdateStat();
    }

    private void onBackContinuePlay(User user, Room room) {
        GamePlayStatesServerMsg gamePlayStatesServerMsg = new GamePlayStatesServerMsg();
        gamePlayStatesServerMsg.setStates(room.getGame().buildGamePlayStatesResponse());
        room.getUserGameState(user).setOnline(true);
        send(gamePlayStatesServerMsg, user);
    }

    private void onGuestLogin(UserLoginClientMsg loginMsg) {
        GuestUser guestUser = new GuestUser();
        userSessionManager.setBinding(guestUser, loginMsg.getSession());
        userManager.loginGuestUser(guestUser);
        channelManager.joinDefaultChannels(guestUser);
    }

    private void onGuestLogout(Session session, User guestUser) {
        userSessionManager.removeBinding(session);
        userManager.removeGuestUser(guestUser);
        channelManager.leaveDefaultChannels(guestUser);
    }

    private void sendUpdateStat() {
        OnlineStatServerMsg statMsg = new OnlineStatServerMsg();
        statMsg.setOnline(sessionUserCount);
        
        lobbyService.broadcast(statMsg);
    }
}
