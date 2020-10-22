package io.github.hulang1024.chinesechess.client;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.drafts.Draft_6455;
import org.java_websocket.handshake.ServerHandshake;

import java.net.URI;

/**
 * @author Hu Lang
 */
public class ChineseChessClient {
    private static ChineseChessClient instance;
    private WebSocketClient webSocketClient;

    private ChineseChessClient() {
        try {
            webSocketClient = new WebSocketClient(new URI("ws://127.0.0.1:7777/ws/xxx"), new Draft_6455()) {
                @Override
                public void onOpen(ServerHandshake serverHandshake) {

                }

                @Override
                public void onMessage(String s) {
                    WebSocketMessageHandler.onMessage(s);
                }

                @Override
                public void onClose(int i, String s, boolean b) {

                }

                @Override
                public void onError(Exception e) {

                }
            };
        } catch (Exception e) {
            e.printStackTrace();
        }
        webSocketClient.connect();
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
