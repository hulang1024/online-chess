package io.github.hulang1024.chinesechess.client.message;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;

import lombok.extern.slf4j.Slf4j;


/**
 * 消息注册/转发器
 * @author Hu Lang
 */
@Slf4j
public class ServerMessageDispatcher {
    private static Map<Class<?>, List<MessageHandler<?>>> messageHandlerMap = new HashMap<>();
    private static Map<MessageHandler<?>, Boolean> onceHandlerMap = new HashMap<>();
    private static Gson gson = new Gson();
    
    @SuppressWarnings("all")
    public static void dispatch(String messageJson) {
        JsonObject jsonObject = (JsonObject)JsonParser.parseString(messageJson);
        String type = ((JsonPrimitive)jsonObject.get("type")).getAsString();
        Class<?> typeClass = ServerMessageFactory.getMessageClassByType(type);
        if (typeClass == null) {
            log.info("未找到消息类 type={}", type);
            return;
        }
        List<MessageHandler<?>> handlers = messageHandlerMap.get(typeClass);
        if (handlers != null) {
            ServerMessage message = (ServerMessage)gson.fromJson(jsonObject, typeClass);

            List<MessageHandler<?>> handlersToRemove = new ArrayList<>();
            handlers.forEach((MessageHandler handler) -> {
                handler.handle(message);
                if (onceHandlerMap.containsKey(handler)) {
                    onceHandlerMap.remove(handler);
                    handlersToRemove.add(handler);
                }
            });
            handlers.removeAll(handlersToRemove);
        }
    }

    public static <T> void addMessageOnceHandler(Class<T> type, MessageHandler<T> handler) {
        addMessageHandler(type, handler);
        onceHandlerMap.put(handler, true);
    }

    public static <T> void addMessageHandler(Class<T> type, MessageHandler<T> handler) {
        List<MessageHandler<?>> handlers = messageHandlerMap.get(type);
        if (handlers == null) {
            handlers = new ArrayList<MessageHandler<?>>();
            messageHandlerMap.put(type, handlers);
        }
        handlers.add(handler);
    }

    public static <T> void removeMessageHandler(Class<T> type, MessageHandler<T> handler) {
        List<MessageHandler<?>> handlers = messageHandlerMap.get(type);
        if (handlers != null) {
            handlers.remove(handler);
        }
    }
}
