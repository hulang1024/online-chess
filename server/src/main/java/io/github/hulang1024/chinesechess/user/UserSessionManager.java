package io.github.hulang1024.chinesechess.user;

import io.netty.channel.ChannelId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.yeauty.pojo.Session;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 *
 * 维护用户和关联的 WebSocket Session
 * session是随着连接（例如打开了一个新网页，或是更换了客户端，断开重连都会是一个新的session，
 * 业务逻辑应该直接依赖用户，而非session。
 */
@Component
public class UserSessionManager {
    public static int onlineUserCount = 0;
    public static int guestCount = 0;

    @Autowired
    private OnlineListener onlineListener;

    private static Map<Long, Session> userSessionMap = new ConcurrentHashMap<>();
    private static Map<ChannelId, Session> sessionMap = new ConcurrentHashMap<>();

    public static final String USER_ID_KEY = "userId";

    public boolean isConnected(User user) {
        return isConnected(user.getId());
    }

    public boolean isConnected(long userId) {
        Session session = userSessionMap.get(userId);
        return session != null && session.isOpen();
    }

    public Session getSession(User user) {
        return userSessionMap.get(user.getId());
    }

    public Long getBoundUserId(Session session) {
        return session.getAttribute(USER_ID_KEY);
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

        if (user instanceof GuestUser) {
            guestCount++;
        } else {
            onlineUserCount++;
        }
        onlineListener.onOnline(user);

        return true;
    }

    /**
     * 移除该用户的session绑定
     * @param user
     */
    public void removeBinding(User user) {
        Session session = getSession(user);
        if (session == null) {
            return;
        }

        Long userId = getBoundUserId(session);
        if (userId == null) {
            return;
        }
        session.setAttribute(USER_ID_KEY, null);
        userSessionMap.remove(userId);
        sessionMap.remove(session.id());

        if (user instanceof GuestUser) {
            guestCount--;
        } else {
            onlineUserCount--;
        }
        onlineListener.onOffline(user);
    }
}
