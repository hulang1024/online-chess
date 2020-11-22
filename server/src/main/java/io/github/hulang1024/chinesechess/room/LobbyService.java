package io.github.hulang1024.chinesechess.room;

import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.user.UserSessionManager;
import io.github.hulang1024.chinesechess.websocket.message.MessageUtils;
import io.github.hulang1024.chinesechess.websocket.message.ServerMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.yeauty.pojo.Session;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class LobbyService {
    /**
     * 停留在大厅界面的客户端session
     */
    private static List<Session> stayLobbySessions = new CopyOnWriteArrayList<>();

    @Autowired
    private UserSessionManager userSessionManager;

    public void broadcast(ServerMessage message, User... excludes) {
        Session excludeSession = excludes.length == 0 ? null : userSessionManager.getSession(excludes[0]);
        stayLobbySessions.forEach(session -> {
            if (session.equals(excludeSession)) {
                return;
            }
            MessageUtils.send(message, session);
        });
    }

    public void addStayLobbySession(Session session) {
        if (!stayLobbySessions.contains(session)) {
            stayLobbySessions.add(session);
        }
    }

    public void removeStayLobbySession(Session session) {
        stayLobbySessions.remove(session);
    }
}
