package io.github.hulang1024.chinesechess.ws.message;


import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.user.UserSessionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.yeauty.pojo.Session;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public abstract class AbstractMessageListener {
    @Autowired
    protected UserSessionManager userSessionManager;

    public AbstractMessageListener() {
        log.info("instantiate: {}", getClass().getSimpleName());
    }

    public <T> void addMessageHandler(Class<T> typeClass, MessageHandler<T> handler) {
        ClientMessageDispatcher.addMessageHandler(typeClass, handler);
    }

    public <T> void emit(Class<?> typeClass, ClientMessage message) {
        ClientMessageDispatcher.emit(typeClass, message);
    }

    public void send(ServerMessage message, Session session) {
        MessageUtils.send(message, session);
    }

    public void send(ServerMessage message, User user) {
        send(message, userSessionManager.getSession(user));
    }

    public abstract void init();
}
