package io.github.hulang1024.chinesechess.room;

import io.github.hulang1024.chinesechess.message.MessageUtils;
import io.github.hulang1024.chinesechess.message.ServerMessage;
import io.github.hulang1024.chinesechess.user.User;
import org.springframework.stereotype.Service;
import org.yeauty.pojo.Session;

import java.util.ArrayList;
import java.util.List;

@Service
public class LobbyService {
    /**
     * 停留在大厅界面的客户端session
     */
    private static List<Session> stayLobbySessions = new ArrayList<>();

    public void broadcast(ServerMessage message, User exclude) {
        getAllStayLobbySessions().forEach(session -> {
            if (exclude.getSession().equals(session)) {
                return;
            }
            MessageUtils.send(message, session);
        });
    }

    public List<Session> getAllStayLobbySessions() {
        return stayLobbySessions;
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
