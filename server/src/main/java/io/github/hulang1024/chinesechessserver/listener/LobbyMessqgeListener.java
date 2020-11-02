package io.github.hulang1024.chinesechessserver.listener;

import io.github.hulang1024.chinesechessserver.message.client.lobby.LobbyEnter;
import io.github.hulang1024.chinesechessserver.message.client.lobby.LobbyExit;
import io.github.hulang1024.chinesechessserver.service.LobbyService;

public class LobbyMessqgeListener extends MessageListener {
    private LobbyService lobbyService = new LobbyService();

    @Override
    public void init() {
        addMessageHandler(LobbyEnter.class, (lobbyEnter) -> {
            lobbyService.addStayLobbySession(lobbyEnter.getSession());
        });
        
        addMessageHandler(LobbyExit.class, (lobbyExit) -> {
            lobbyService.removeStayLobbySession(lobbyExit.getSession());
        });
    }
}
