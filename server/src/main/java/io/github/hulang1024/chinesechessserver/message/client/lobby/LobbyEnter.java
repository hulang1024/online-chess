package io.github.hulang1024.chinesechessserver.message.client.lobby;

import io.github.hulang1024.chinesechessserver.message.ClientMessage;
import io.github.hulang1024.chinesechessserver.message.client.MessageType;
import lombok.Data;

@Data
@MessageType("lobby.enter")
public class LobbyEnter extends ClientMessage {

}
