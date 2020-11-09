package io.github.hulang1024.chinesechess;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.drafts.Draft_6455;
import org.java_websocket.handshake.ServerHandshake;

import java.net.URI;

import com.google.gson.Gson;

import io.github.hulang1024.chinesechess.message.ServerMessageDispatcher;
import io.github.hulang1024.chinesechess.message.MessageHandler;
import lombok.extern.slf4j.Slf4j;
import io.github.hulang1024.chinesechess.message.ClientMessage;

/**
 * @author Hu Lang
 */
@Slf4j
public class ChineseChessClient {
    private static ChineseChessClient instance;
    private WebSocketClient webSocketClient;
    private static Gson gson = new Gson();

    private ChineseChessClient() {
        try {
            webSocketClient = new WebSocketClient(new URI("ws://180.76.185.34:9097"), new Draft_6455()) {
                @Override
                public void onOpen(ServerHandshake serverHandshake) {
                    log.info("连接打开");
                }

                @Override
                public void onMessage(String message) {
                    log.info("收到消息: {}", message);
                    ServerMessageDispatcher.dispatch(message);
                }

                @Override
                public void onClose(int i, String s, boolean b) {
                    log.info("连接关闭");
                }

                @Override
                public void onError(Exception e) {
                    log.info("错误: {}", e);
                }
            };
        } catch (Exception e) {
            e.printStackTrace();
        }
        webSocketClient.connect();
    }

    /**
     * 往服务器发送消息
     * @param message
     */
    public void send(ClientMessage message) {
        if (!webSocketClient.isOpen()) {
            webSocketClient.connect();
            log.info("连接未打开");
            return;
        }

        String messageJson = gson.toJson(message);
        log.info("发送消息: {}", messageJson);
        webSocketClient.send(messageJson);
    }

    public <T> void addMessageOnceHandler(Class<T> type, MessageHandler<T> handler) {
        ServerMessageDispatcher.addMessageOnceHandler(type, handler);
    }

    public <T> void addMessageHandler(Class<T> type, MessageHandler<T> handler) {
        ServerMessageDispatcher.addMessageHandler(type, handler);
    }

    public <T> void removeMessageHandler(Class<T> type, MessageHandler<T> handler) {
        ServerMessageDispatcher.removeMessageHandler(type, handler);
    }

    public static ChineseChessClient getInstance() {
        if (instance == null) {
            try {
                instance = new ChineseChessClient();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return instance;
    }
}
