package io.github.hulang1024.chinesechessserver.message;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.reflections.Reflections;

import io.github.hulang1024.chinesechessserver.message.client.MessageType;

public class ClientMessageFactory {
    private static Map<String, Class<?>> messageTypeClassMap = new HashMap<String, Class<?>>();
    static {
        // 扫描所有客户端消息类并加入Map
        Reflections reflections = new Reflections("io.github.hulang1024.chinesechessserver.message.client");
        Set<Class<?>> messageClasses = reflections.getTypesAnnotatedWith(MessageType.class);
        messageClasses.forEach(clazz -> {
            String messageCode = clazz.getAnnotation(MessageType.class).value();
            messageTypeClassMap.put(messageCode, clazz);
        });
    }

    public static Class<?> getMessageClassByType(String type) {
        return messageTypeClassMap.get(type);
    }
}
