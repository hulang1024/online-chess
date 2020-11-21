package io.github.hulang1024.chinesechess.room;

import io.github.hulang1024.chinesechess.user.UserMessageListener;
import io.github.hulang1024.chinesechess.websocket.message.AbstractMessageListener;
import io.github.hulang1024.chinesechess.websocket.message.server.stat.OnlineStatServerMsg;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class LobbyMessageListener extends AbstractMessageListener {
    @Autowired
    private LobbyService lobbyService;

    @Override
    public void init() {
        addMessageHandler(LobbyEnterMsg.class, (lobbyEnter) -> {
            lobbyService.addStayLobbySession(lobbyEnter.getSession());

            OnlineStatServerMsg statMsg = new OnlineStatServerMsg();
            statMsg.setOnline(UserMessageListener.sessionUserCount);
            lobbyService.broadcast(statMsg, null);
        });
        
        addMessageHandler(LobbyExitMsg.class, (lobbyExit) -> {
            lobbyService.removeStayLobbySession(lobbyExit.getSession());
        });
    }
}
