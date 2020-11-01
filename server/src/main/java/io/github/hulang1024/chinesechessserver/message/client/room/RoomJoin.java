package io.github.hulang1024.chinesechessserver.message.client.room;

import io.github.hulang1024.chinesechessserver.message.ClientMessage;
import lombok.Data;

@Data
public class RoomJoin extends ClientMessage {
    private long roomId;
}
