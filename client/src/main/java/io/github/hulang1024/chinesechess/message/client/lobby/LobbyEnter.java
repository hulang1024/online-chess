package io.github.hulang1024.chinesechess.message.client.lobby;

import io.github.hulang1024.chinesechess.message.ClientMessage;
import lombok.Data;

@Data
public class LobbyEnter extends ClientMessage {
    public LobbyEnter() {
        super("lobby.enter");
    }
}
