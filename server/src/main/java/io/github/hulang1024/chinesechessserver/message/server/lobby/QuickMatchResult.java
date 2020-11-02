package io.github.hulang1024.chinesechessserver.message.server.lobby;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class QuickMatchResult extends ServerMessage {
    public QuickMatchResult() {
        super("lobby.quick_match");
    }
}
