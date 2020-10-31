package io.github.hulang1024.chinesechessserver.message;

import java.util.HashMap;
import java.util.Map;

import java.util.List;
import java.util.ArrayList;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;

import org.yeauty.pojo.Session;

import lombok.extern.slf4j.Slf4j;


/**
 * 消息注册/转发器
 * @author Hu Lang
 */
@Slf4j
public class ClientMessageDispatcher {
    private static Map<Class<?>, List<MessageHandler<?>>> messageHandlerMap = new HashMap<>();
    private static Gson gson = new Gson();
    
    @SuppressWarnings("all")
    public static void dispatch(String messageJson, Session session) {
        JsonObject jsonObject = (JsonObject)JsonParser.parseString(messageJson);
        String type = ((JsonPrimitive)jsonObject.get("type")).getAsString();
        Class<?> typeClass = ClientMessageFactory.getMessageClassByType(type);
        if (typeClass == null) {
            log.info("未找到消息类 type={}", type);
            return;
        }
        List<MessageHandler<?>> handlers = messageHandlerMap.get(typeClass);
        if (handlers != null) {
            ClientMessage message = (ClientMessage)gson.fromJson(jsonObject, typeClass);
            message.setSession(session);
            
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
