package io.github.hulang1024.chinesechess.user;

import io.github.hulang1024.chinesechess.chat.ChannelManager;
import io.github.hulang1024.chinesechess.message.AbstractMessageListener;
import io.github.hulang1024.chinesechess.room.Room;
import io.github.hulang1024.chinesechess.room.RoomManager;
import io.github.hulang1024.chinesechess.spectator.SpectatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.yeauty.pojo.Session;

import io.github.hulang1024.chinesechess.websocket.ChineseChessWebSocketServerEndpoint;
import io.github.hulang1024.chinesechess.websocket.ClientEventManager;
import io.github.hulang1024.chinesechess.message.server.stat.OnlineStatServerMsg;
import io.github.hulang1024.chinesechess.message.server.user.UserLoginServerMsg;
import io.github.hulang1024.chinesechess.message.server.user.UserOfflineServerMsg;
import io.github.hulang1024.chinesechess.room.LobbyService;

@Component
public class UserMessageListener extends AbstractMessageListener {
    private LobbyService lobbyService = new LobbyService();
    @Autowired
    private ChannelManager channelManager;
    @Autowired
    private RoomManager roomManager;
    @Autowired
    private SpectatorService spectatorService;

    @Override
    public void init() {
        ClientEventManager.addSessionCloseEventHandler(this::onSessionClose);
        ClientEventManager.addSessionOpenEventHandler(this::onSessionOpen);
        addMessageHandler(UserLoginClientMsg.class, this::onUserLogin);

    }

    private void onSessionOpen(Session session) {
    }

    private void onSessionClose(Session session) {
        User user = OnlineUserManager.getUser(session);

        if (user != null) {
            // 离开房间
            if (user.isJoinedAnyRoom()) {
                Room room = user.getJoinedRoom();

                roomManager.part(user.getJoinedRoom(), user);

                // 发送用户离线消息
                UserOfflineServerMsg userOfflineMsg = new UserOfflineServerMsg();
                userOfflineMsg.setUid(user.getId());
                userOfflineMsg.setNickname(user.getNickname());
                room.getUsers().forEach(roomUser -> {
                    if (!roomUser.equals(user)) {
                        send(userOfflineMsg, roomUser.getSession());
                    }
                });
            }

            // 离开观看
            if (user.isSpectatingAnyRoom()) {
                spectatorService.leave(user);
            }

            channelManager.getChannelById(1L).removeUser(user);

            OnlineUserManager.removeBinding(session);
        }

        lobbyService.removeStayLobbySession(session);

        // 发送统计消息
        sendUpdateStat();
    }

    private void onUserLogin(UserLoginClientMsg msg) {
        OnlineUserManager.setBinding(msg.getUserId(), msg.getSession());
        User user = OnlineUserManager.getUser(msg.getSession());
        channelManager.getChannelById(1L).joinUser(user);

        // 发送登录成功
        UserLoginServerMsg loginResult = new UserLoginServerMsg();
        loginResult.setCode(0);
        send(loginResult, msg.getSession());
    }

    private void sendUpdateStat() {
        OnlineStatServerMsg statMsg = new OnlineStatServerMsg();
        statMsg.setOnline(ChineseChessWebSocketServerEndpoint.connectedSessionCount);
        
        lobbyService.getAllStayLobbySessions().forEach(session -> {
            send(statMsg, session);
        });
    }
}
