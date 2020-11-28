package io.github.hulang1024.chinesechess.user;

import io.netty.channel.ChannelId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.yeauty.pojo.Session;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class UserSessionManager {
    public static int onlineUserCount = 0;

    @Autowired
    private OnlineListener onlineListener;

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

        // 是用户加入(非游客)
        if (!(user instanceof GuestUser)) {
            onlineUserCount++;

            onlineListener.onOnline(user);
        }

        return true;
    }

    /**
     * 移除该session的用户绑定
     * @param session
     */
    public boolean removeBinding(Session session) {
        Long userId = session.getAttribute(USER_ID_KEY);
        if (userId == null) {
            return false;
        }
        session.setAttribute(USER_ID_KEY, null);
        userSessionMap.remove(userId);
        sessionMap.remove(session.id());
        return true;
    }

    public void removeBinding(User user) {
        Session session = getSession(user);
        if (session == null) {
            return;
        }

        boolean removed = removeBinding(session);

        // 是用户连接断开(非游客)
        if (removed && !(user instanceof GuestUser)) {
            onlineUserCount--;

            onlineListener.onOffline(user);
        }
    }
}
