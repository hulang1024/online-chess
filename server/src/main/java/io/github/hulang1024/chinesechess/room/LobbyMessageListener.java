package io.github.hulang1024.chinesechess.room;

import io.github.hulang1024.chinesechess.room.ws.LobbyEnterMsg;
import io.github.hulang1024.chinesechess.room.ws.LobbyExitMsg;
import io.github.hulang1024.chinesechess.ws.message.AbstractMessageListener;
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
        });
        
        addMessageHandler(LobbyExitMsg.class, (lobbyExit) -> {
            lobbyService.removeStayLobbySession(lobbyExit.getSession());
        });
    }
}
