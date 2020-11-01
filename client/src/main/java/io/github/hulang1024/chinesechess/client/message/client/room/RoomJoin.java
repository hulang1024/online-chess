package io.github.hulang1024.chinesechess.client.message.client.room;

import io.github.hulang1024.chinesechess.client.message.ClientMessage;
import lombok.Data;

@Data
public class RoomJoin extends ClientMessage {
    private long roomId;
    
    public RoomJoin() {
      super("room.join");
    }
}