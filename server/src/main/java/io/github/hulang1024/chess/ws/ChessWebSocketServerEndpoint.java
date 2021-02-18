package io.github.hulang1024.chess.ws;


import io.github.hulang1024.chess.user.UserSessionCloseListener;
import io.netty.handler.codec.http.HttpHeaders;
import io.netty.handler.timeout.IdleStateEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.yeauty.annotation.*;
import org.yeauty.pojo.Session;

import java.io.IOException;

/**
 * @author Hu Lang
 */
@ServerEndpoint(port = "${websocket.port}")
@Slf4j
public class ChessWebSocketServerEndpoint {
    @Autowired
    private ClientMessageDispatcher clientMessageDispatcher;
    @Autowired
    private UserSessionCloseListener userSessionCloseListener;

    @BeforeHandshake
    public void handshake(Session session, HttpHeaders headers){
        session.setSubprotocols("stomp");
    }

    @OnOpen
    public void onOpen(Session session, HttpHeaders headers){
    }

    @OnClose
    public void onClose(Session session) throws IOException {
        userSessionCloseListener.onClose(session, true);
    }

    @OnError
    public void onError(Session session, Throwable e) {
        //log.info("错误: {}", e);
    }

    @OnMessage
    public void onMessage(Session session, String message) {
        clientMessageDispatcher.onMessage(message, session);
    }

    @OnEvent
    public void onEvent(Session session, Object evt) {
        if (evt instanceof IdleStateEvent) {
            IdleStateEvent idleStateEvent = (IdleStateEvent) evt;
            switch (idleStateEvent.state()) {
                case READER_IDLE:
                    System.out.println("read idle");
                    break;
                case WRITER_IDLE:
                    System.out.println("write idle");
                    break;
                case ALL_IDLE:
                    System.out.println("all idle");
                    break;
                default:
                    break;
            }
        }
    }
}