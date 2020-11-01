package io.github.hulang1024.chinesechess.client.message.client.room;

import io.github.hulang1024.chinesechess.client.message.ClientMessage;
import lombok.Data;

@Data
public class QuickMatch extends ClientMessage {
    public QuickMatch() {
      super("room.quick_match");
    }
}
