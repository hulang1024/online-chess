package io.github.hulang1024.chinesechess.message.client.lobby;

import io.github.hulang1024.chinesechess.message.ClientMessage;
import lombok.Data;

@Data
public class QuickMatch extends ClientMessage {
    public QuickMatch() {
      super("lobby.quick_match");
    }
}
