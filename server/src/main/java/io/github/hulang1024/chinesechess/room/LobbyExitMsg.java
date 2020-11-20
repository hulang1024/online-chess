package io.github.hulang1024.chinesechess.room;

import io.github.hulang1024.chinesechess.message.ClientMessage;
import io.github.hulang1024.chinesechess.message.ClientMsgType;
import lombok.Data;

@Data
@ClientMsgType("lobby.exit")
public class LobbyExitMsg extends ClientMessage {
}
