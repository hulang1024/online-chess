package io.github.hulang1024.chess.ws;

import org.reflections.Reflections;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class ClientMessageManager {
    private static Map<String, Class<?>> messageTypeClassMap = new HashMap<String, Class<?>>();
    static {
        // 扫描所有客户端消息类并加入Map
        Reflections reflections = new Reflections("io.github.hulang1024.chess");
        Set<Class<?>> messageClasses = reflections.getTypesAnnotatedWith(ClientMsgType.class);
        messageClasses.forEach(clazz -> {
            String messageCode = clazz.getAnnotation(ClientMsgType.class).value();
            messageTypeClassMap.put(messageCode, clazz);
        });
    }

    public static Class<?> getMessageClassByType(String type) {
        return messageTypeClassMap.get(type);
    }
}