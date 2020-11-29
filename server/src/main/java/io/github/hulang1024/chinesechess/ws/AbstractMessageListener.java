package io.github.hulang1024.chinesechess.ws;


import io.github.hulang1024.chinesechess.user.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;

@Slf4j
public abstract class AbstractMessageListener {
    @Autowired
    protected WSMessageService wsMessageService;

    public AbstractMessageListener() {
        log.info("instantiate: {}", getClass().getSimpleName());
    }

    public <T> void addMessageHandler(Class<T> typeClass, MessageHandler<T> handler) {
        ClientMessageDispatcher.addMessageHandler(typeClass, handler);
    }

    public <T> void emit(Class<?> typeClass, ClientMessage message) {
        ClientMessageDispatcher.emit(typeClass, message);
    }

    public void send(ServerMessage message, User user) {
        wsMessageService.send(message, user);
    }

    public abstract void init();
}
