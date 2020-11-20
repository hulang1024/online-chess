package io.github.hulang1024.chinesechess.user;

import org.yeauty.pojo.Session;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class OnlineUserManager {
    private static Map<Long, User> userMap = new ConcurrentHashMap<>();
    /**
     * 此map维护用户id和当前获得的session
     * session是随着连接（打开了一个新网页，或是更换了客户端，重新连接都会是一个新的session）。
     */
    private static Map<Long, Session> userSessionMap = new ConcurrentHashMap<>();

    public static void addUser(User user) {
        userMap.put(user.getId(), user);
    }

    public static User getUser(Session session) {
        Long userId = (Long)session.getAttribute("userId");
        return userId != null ? getUserById(userId) : null;
    }

    public static User getUserById(Long userId) {
        return userMap.get(userId);
    }

    /**
     * 给用户绑定websocket session
     * @param userId
     * @param session
     */
    public static void setBinding(Long userId, Session session) {
        session.setAttribute("userId", userId);
        userMap.get(userId).setSession(session);
        userSessionMap.put(userId, session);
    }

    /**
     * 移除该session的用户绑定
     * @param session
     */
    public static void removeBinding(Session session) {
        Long userId = session.getAttribute("userId");
        User user = getUserById(userId);
        user.setSession(null);
        userSessionMap.remove(userId);
    }
}
