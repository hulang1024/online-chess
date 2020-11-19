package io.github.hulang1024.chinesechessserver.user;

import org.yeauty.pojo.Session;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class SessionManager {
    /**
     * 此map维护用户id和当前获得的session
     * session是随着连接（打开了一个新网页，或是更换了客户端，重新连接都会是一个新的session）。
     */
    private static Map<Long, Session> userSessionMap = new ConcurrentHashMap<>();

    public static void addBinding(long userId, Session session) {
        userSessionMap.put(userId, session);
    }

    public static Session getSessionByUserId(long userId) {
        return userSessionMap.get(userId);
    }

    public static void removeBinding(long userId) {
        userSessionMap.remove(userId);
    }
}
