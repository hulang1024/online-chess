package io.github.hulang1024.chinesechess.user;

import io.netty.channel.ChannelId;
import org.springframework.stereotype.Component;
import org.yeauty.pojo.Session;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class UserSessionManager {
    /**
     * 此map维护用户id和当前获得的session
     * session是随着连接（打开了一个新网页，或是更换了客户端，重新连接都会是一个新的session）。
     */
    private static Map<Long, Session> userSessionMap = new ConcurrentHashMap<>();
    private static Map<ChannelId, Session> sessionMap = new ConcurrentHashMap<>();

    public static final String USER_ID_KEY = "userId";

    public boolean isOnline(User user) {
        return getSession(user) != null;
    }

    public boolean isOnline(long userId) {
        return getSession(userId) != null;
    }

    public Session getSession(User user) {
        return userSessionMap.get(user.getId());
    }

    public Session getSession(long userId) {
        return userSessionMap.get(userId);
    }

    public Session getSession(ChannelId id) {
        return sessionMap.get(id);
    }

    /**
     * 给用户绑定websocket session
     * @param user
     * @param session
     */
    public boolean setBinding(User user, Session session) {
        if (user == null) {
            return false;
        }
        session.setAttribute(USER_ID_KEY, user.getId());
        userSessionMap.put(user.getId(), session);
        sessionMap.put(session.id(), session);
        return true;
    }

    /**
     * 移除该session的用户绑定
     * @param session
     */
    public void removeBinding(Session session) {
        Long userId = session.getAttribute(USER_ID_KEY);
        if (userId == null) {
            return;
        }
        session.setAttribute(USER_ID_KEY, null);
        userSessionMap.remove(userId);
        sessionMap.remove(session.id());
    }

}
