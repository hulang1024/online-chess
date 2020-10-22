package io.github.hulang1024.chinesechess.socket;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.drafts.Draft_6455;
import org.java_websocket.handshake.ServerHandshake;

import java.net.URI;

/**
 * @author Hu Lang
 */
public class ChineseChessWebSocketClient extends WebSocketClient {
    private static ChineseChessWebSocketClient instance;

    public static ChineseChessWebSocketClient getInstance() {
        if (instance == null) {
            try {
                instance = new ChineseChessWebSocketClient(new URI("ws://127.0.0.1:7777/ws/xxx"));
                instance.connect();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return instance;
    }

    public ChineseChessWebSocketClient(URI serverUri) {
        super(serverUri, new Draft_6455());
    }

    @Override
    public void onOpen(ServerHandshake serverHandshake) {
        System.out.println("onOpen");

        send("test");
    }

    @Override
    public void onMessage(String s) {
        System.out.println("onMessage");
    }

    @Override
    public void onClose(int i, String s, boolean b) {
        System.out.println("onClose");
    }

    @Override
    public void onError(Exception e) {
        System.out.println("onError");
    }
}
