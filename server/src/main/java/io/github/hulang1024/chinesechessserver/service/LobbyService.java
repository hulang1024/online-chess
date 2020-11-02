package io.github.hulang1024.chinesechessserver.service;

import java.util.ArrayList;
import java.util.List;

import org.yeauty.pojo.Session;

public class LobbyService {
    /**
     * 停留在大厅界面的客户端session
     */
    private static List<Session> stayLobbySessions = new ArrayList<>();

    public List<Session> getAllStayLobbySessions() {
        return stayLobbySessions;
    }
    
    public void addStayLobbySession(Session session) {
        stayLobbySessions.add(session);
    }

    public void removeStayLobbySession(Session session) {
        stayLobbySessions.remove(session);
    }
}
