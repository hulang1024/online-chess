package io.github.hulang1024.chinesechessserver.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.yeauty.pojo.Session;

import io.github.hulang1024.chinesechessserver.database.entity.EntityUser;
import io.netty.channel.ChannelId;

public class UserSessionService {
    private static Map<ChannelId, SessionUser> sessionUserMap = new ConcurrentHashMap<>();

    public void login(Session session) {
        if (sessionUserMap.get(session.id()) != null) {
            return;
        }

        EntityUser user = new EntityUser();
        user.setId(Long.parseLong(session.id().asShortText(), 16));
        user.setNickname(user.getId() + "");

        SessionUser sessionUser = new SessionUser();
        sessionUser.setSession(session);
        sessionUser.setUser(user);
        sessionUserMap.put(session.id(), sessionUser);
    }

    public SessionUser getUserBySession(Session session) {
        return sessionUserMap.get(session.id());
    }

    public void remove(Session session) {
        sessionUserMap.remove(session.id());
    }
}
