package io.github.hulang1024.chinesechess.room;

import io.github.hulang1024.chinesechess.message.AbstractMessageListener;
import io.github.hulang1024.chinesechess.websocket.ChineseChessWebSocketServerEndpoint;
import io.github.hulang1024.chinesechess.message.server.stat.OnlineStatServerMsg;
import org.springframework.stereotype.Component;

@Component
public class LobbyMessageListener extends AbstractMessageListener {
    private LobbyService lobbyService = new LobbyService();

    @Override
    public void init() {
        addMessageHandler(LobbyEnterMsg.class, (lobbyEnter) -> {
            lobbyService.addStayLobbySession(lobbyEnter.getSession());

            OnlineStatServerMsg statMsg = new OnlineStatServerMsg();
            statMsg.setOnline(ChineseChessWebSocketServerEndpoint.connectedSessionCount);
            lobbyService.getAllStayLobbySessions().forEach(session -> {
                send(statMsg, session);
            });
        });
        
        addMessageHandler(LobbyExitMsg.class, (lobbyExit) -> {
            lobbyService.removeStayLobbySession(lobbyExit.getSession());
        });
    }
}
