package io.github.hulang1024.chinesechess.websocket;


import io.github.hulang1024.chinesechess.websocket.message.ClientMessageDispatcher;
import io.netty.handler.codec.http.HttpHeaders;
import io.netty.handler.timeout.IdleStateEvent;
import lombok.extern.slf4j.Slf4j;

import org.yeauty.annotation.*;
import org.yeauty.pojo.Session;

import java.io.IOException;

/**
 * @author Hu Lang
 */
@ServerEndpoint(port = "${websocket.port}")
@Slf4j
public class ChineseChessWebSocketServerEndpoint {

    @BeforeHandshake
    public void handshake(Session session, HttpHeaders headers){
        session.setSubprotocols("stomp");
    }

    @OnOpen
    public void onOpen(Session session, HttpHeaders headers){
        ClientSessionEventManager.emitSessionOpenEvent(session);
    }

    @OnClose
    public void onClose(Session session) throws IOException {
        ClientSessionEventManager.emitSessionCloseEvent(session);
    }

    @OnError
    public void onError(Session session, Throwable e) {
        log.info("错误: {}", e);
    }

    @OnMessage
    public void onMessage(Session session, String message) {
        if ("ping".equals(message)) {
            session.sendText("pong");
            return;
        }
        
        //log.info("收到消息: {}", message);
        ClientMessageDispatcher.dispatch(message, session);
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
