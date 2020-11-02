package io.github.hulang1024.chinesechess.message;

import java.util.Map;
import java.util.Set;

import org.reflections.Reflections;

import java.util.HashMap;

import io.github.hulang1024.chinesechess.message.server.MessageType;

public class ServerMessageFactory {
    private static Map<String, Class<?>> messageTypeClassMap = new HashMap<String, Class<?>>();
    static {
        Reflections reflections = new Reflections("io.github.hulang1024.chinesechess.message.server");
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