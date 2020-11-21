package io.github.hulang1024.chinesechess.websocket.message;

import com.alibaba.fastjson.JSONObject;
import lombok.extern.slf4j.Slf4j;
import org.yeauty.pojo.Session;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


/**
 * 消息注册/转发器
 * @author Hu Lang
 */
@Slf4j
public class ClientMessageDispatcher {
    private static Map<Class<?>, List<MessageHandler<?>>> messageHandlerMap = new ConcurrentHashMap<>();

    public static void dispatch(String messageJson, Session session) {
        JSONObject jsonObject = JSONObject.parseObject(messageJson);
        String type = jsonObject.get("type").toString();
        Class<?> typeClass = ClientMessageManager.getMessageClassByType(type);
        if (typeClass == null) {
            log.info("未找到消息类 type={}", type);
            return;
        }
        ClientMessage message = (ClientMessage)jsonObject.toJavaObject(typeClass);
        message.setSession(session);
        
        emit(typeClass, message);
    }

    /**
     * 触发一个消息，
     * 支持服务器内调用以转发消息到其它模块
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

    public static <T> void addMessageHandler(Class<T> type, MessageHandler<T> handler) {
        List<MessageHandler<?>> handlers = messageHandlerMap.get(type);
        if (handlers == null) {
            handlers = new ArrayList<MessageHandler<?>>();
            messageHandlerMap.put(type, handlers);
        }
        handlers.add(handler);
    }
}
