package io.github.hulang1024.chinesechessserver;


import io.github.hulang1024.chinesechessserver.message.ClientMessageDispatcher;
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
public class ChineseChessServerEndpoint {
    public static int connectedSessionCount = 0;
    
    @BeforeHandshake
    public void handshake(Session session, HttpHeaders headers){
        session.setSubprotocols("stomp");
    }

    @OnOpen
    public void onOpen(Session session, HttpHeaders headers){
        log.info("一个连接打开");
        connectedSessionCount++;
        ClientEventManager.emitSessionOpenEvent(session);
    }

    @OnClose
    public void onClose(Session session) throws IOException {
        log.info("一个连接关闭");
        connectedSessionCount--;
        ClientEventManager.emitSessionCloseEvent(session);
    }

    @OnError
    public void onError(Session session, Throwable e) {
        log.info("错误: {}", e);
    }

    @OnMessage
    public void onMessage(Session session, String message) {
        if (message.equals("ping")) {
            session.sendText("pong");
            return;
        }
        
        log.info("收到消息: {}", message);
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
