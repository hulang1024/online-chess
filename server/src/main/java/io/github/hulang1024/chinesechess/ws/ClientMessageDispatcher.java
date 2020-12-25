package io.github.hulang1024.chinesechess.ws;

import com.alibaba.fastjson.JSONObject;
import io.github.hulang1024.chinesechess.http.TokenUtils;
import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.user.UserManager;
import io.github.hulang1024.chinesechess.user.UserSessionManager;
import io.github.hulang1024.chinesechess.user.UserUtils;
import io.github.hulang1024.chinesechess.user.ws.UserLoginClientMsg;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.yeauty.pojo.Session;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


/**
 * 消息注册/转发器
 * @author Hu Lang
 */
@Component
@Slf4j
public class ClientMessageDispatcher {
    /**
     * 消息类 -> 消息处理器
     */
    private static Map<Class<?>, List<MessageHandler<?>>> messageHandlerMap = new ConcurrentHashMap<>();

    @Autowired
    private WSMessageService wsMessageService;
    @Autowired
    private UserManager userManager;
    @Autowired
    private UserSessionManager userSessionManager;

    public void onMessage(String messageJson, Session session) {
        ClientMessage message = parseMessage(messageJson);

        User user = null;
        if (message instanceof UserLoginClientMsg) {
            // 如果是WebSocket验证（WebSocket登录）消息
            UserLoginClientMsg clientLoginMsg = (UserLoginClientMsg)message;
            clientLoginMsg.setSession(session);
            // 验证token，并且从中解析出用户信息
            if ("guest".equals(clientLoginMsg.getToken())) {
                clientLoginMsg.setUserId(-1);
            } else {
                user = TokenUtils.verifyParseUserInfo(clientLoginMsg.getToken());
                if (user == null) {
                    wsMessageService.send(new ErrorMessage("token错误"), session);
                    return;
                }
                clientLoginMsg.setUserId(user.getId());
            }
        } else {
            // 获得登录正式/游客用户
            Long userId = userSessionManager.getBoundUserId(session);
            if (userId == null) {
                return;
            }
            user = userId > 0 ? userManager.getLoggedInUser(userId) : userManager.getGuestUser(userId);
            if (user == null || user.getId() == null) {
                wsMessageService.send(new ErrorMessage("用户未登录"), session);
                return;
            }
            message.setUser(user);
        }

        UserUtils.set(user);

        emit(message.getClass(), message);
    }

    private ClientMessage parseMessage(String messageJson) {
        JSONObject jsonObject = JSONObject.parseObject(messageJson);
        String type = jsonObject.get("type").toString();
        Class<?> typeClass = ClientMessageManager.getMessageClassByType(type);
        if (typeClass == null) {
            log.info("未找到消息类 type={}", type);
            return null;
        }
        return (ClientMessage)jsonObject.toJavaObject(typeClass);
    }

    /**
     * 触发一个消息，它是为支持服务器内调用以转发消息到其它模块
     * @param typeClass 消息类型
     * @param message 消息
     */
    @SuppressWarnings("all")
    public static void emit(Class<?> typeClass, ClientMessage message) {
        List<MessageHandler<?>> handlers = messageHandlerMap.get(typeClass);
        if (handlers != null) {
            handlers.forEach((MessageHandler handler) -> {
                handler.handle(message);
            });
        }
    }

    /**
     * 加一个消息处理器
     * @param type
     * @param handler
     * @param <T>
     */
    public static <T> void addMessageHandler(Class<T> type, MessageHandler<T> handler) {
        List<MessageHandler<?>> handlers = messageHandlerMap.get(type);
        if (handlers == null) {
            handlers = new ArrayList<MessageHandler<?>>();
            messageHandlerMap.put(type, handlers);
        }
        handlers.add(handler);
    }
}
