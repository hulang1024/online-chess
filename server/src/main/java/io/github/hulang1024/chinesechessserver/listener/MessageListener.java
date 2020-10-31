package io.github.hulang1024.chinesechessserver.listener;

import com.google.gson.Gson;

import org.yeauty.pojo.Session;

import io.github.hulang1024.chinesechessserver.message.ClientMessageDispatcher;
import io.github.hulang1024.chinesechessserver.message.MessageHandler;
import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public abstract class MessageListener {
    private static Gson gson = new Gson();

    public <T> void addMessageHandler(Class<T> type, MessageHandler<T> handler) {
      ClientMessageDispatcher.addMessageHandler(type, handler);
    }

    public void send(ServerMessage message, Session session) {
        String messageJson = gson.toJson(message);
        log.info("发送消息: {}", messageJson);
        session.sendText(messageJson);
    }

    public abstract void init();

}
