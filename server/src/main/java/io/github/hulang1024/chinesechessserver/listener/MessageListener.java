package io.github.hulang1024.chinesechessserver.listener;

import com.google.gson.Gson;

import org.yeauty.pojo.Session;

import io.github.hulang1024.chinesechessserver.message.ClientMessage;
import io.github.hulang1024.chinesechessserver.message.ClientMessageDispatcher;
import io.github.hulang1024.chinesechessserver.message.MessageHandler;
import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public abstract class MessageListener {
    private static Gson gson = new Gson();

    public MessageListener() {
        log.info("instantiate: {}", getClass().getSimpleName());
    }

    public <T> void addMessageHandler(Class<T> typeClass, MessageHandler<T> handler) {
        ClientMessageDispatcher.addMessageHandler(typeClass, handler);
    }

    public <T> void emit(Class<?> typeClass, ClientMessage message) {
        ClientMessageDispatcher.emit(typeClass, message);
    }

    public void send(ServerMessage message, Session session) {
        String messageJson = gson.toJson(message);
        log.info("发送消息: {}", messageJson);
        session.sendText(messageJson);
    }

    public abstract void init();
}
