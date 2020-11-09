package io.github.hulang1024.chinesechessserver.listener;

import java.nio.channels.Channel;

import org.springframework.util.StringUtils;
import org.yeauty.pojo.Session;

import io.github.hulang1024.chinesechessserver.ChineseChessServerEndpoint;
import io.github.hulang1024.chinesechessserver.ClientEventManager;
import io.github.hulang1024.chinesechessserver.domain.SessionUser;
import io.github.hulang1024.chinesechessserver.domain.chat.ChatChannel;
import io.github.hulang1024.chinesechessserver.message.client.user.UserNicknameSet;
import io.github.hulang1024.chinesechessserver.message.client.room.RoomLeave;
import io.github.hulang1024.chinesechessserver.message.server.stat.OnlineStatMessage;
import io.github.hulang1024.chinesechessserver.message.server.user.UserLoginResult;
import io.github.hulang1024.chinesechessserver.message.server.user.UserNicknameSetResult;
import io.github.hulang1024.chinesechessserver.message.server.user.UserOfflineMsg;
import io.github.hulang1024.chinesechessserver.service.ChatChannelManager;
import io.github.hulang1024.chinesechessserver.service.LobbyService;
import io.github.hulang1024.chinesechessserver.service.UserSessionService;

public class UserMessageListener extends MessageListener {
    private UserSessionService userSessionService = new UserSessionService();
    private LobbyService lobbyService = new LobbyService();

    @Override
    public void init() {
        ClientEventManager.addSessionCloseEventHandler(this::onSessionClose);
        ClientEventManager.addSessionOpenEventHandler(this::onSessionOpen);
        addMessageHandler(UserNicknameSet.class, this::setNickname);
    }

    private void onSessionOpen(Session session) {
        // 这里做个"登录"的逻辑，暂时支持游客登录
        userSessionService.login(session);
        SessionUser user = userSessionService.getUserBySession(session);

        ChatChannelManager.getGlobal().joinUser(user);

        UserLoginResult loginResult = new UserLoginResult();
        loginResult.setCode(0);
        loginResult.setUser(userSessionService.getUserBySession(session).getUser());
        send(loginResult, session);

        sendUpdateStat();
    }

    private void onSessionClose(Session session) {
        SessionUser user = userSessionService.getUserBySession(session);

        // 发送用户离线消息
        UserOfflineMsg userOfflineMsg = new UserOfflineMsg();
        userOfflineMsg.setUid(user.getId());
        userOfflineMsg.setNickname(user.getUser().getNickname());
        send(userOfflineMsg, session);

        // 发送离开房间消息
        if (user != null && user.isJoinedAnyRoom()) {
            RoomLeave leave = new RoomLeave();
            leave.setSession(session);
            emit(RoomLeave.class, leave);
        }

        lobbyService.removeStayLobbySession(session);
        userSessionService.remove(session);

        ChatChannelManager.getGlobal().removeUser(user);

        // 发送统计消息
        sendUpdateStat();
    }

    private void setNickname(UserNicknameSet set) {
        UserNicknameSetResult result = new UserNicknameSetResult();

        if (StringUtils.isEmpty(StringUtils.trimAllWhitespace(set.getNickname()))) {
            result.setCode(1);
            send(result, set.getSession());
        }

        SessionUser user = userSessionService.getUserBySession(set.getSession());
        user.getUser().setNickname(set.getNickname());

        result.setNickname(user.getUser().getNickname());
        send(result, set.getSession());
    }

    private void sendUpdateStat() {
        OnlineStatMessage statMsg = new OnlineStatMessage();
        statMsg.setOnline(ChineseChessServerEndpoint.connectedSessionCount);
        
        lobbyService.getAllStayLobbySessions().forEach(session -> {
            send(statMsg, session);
        });
    }
}
