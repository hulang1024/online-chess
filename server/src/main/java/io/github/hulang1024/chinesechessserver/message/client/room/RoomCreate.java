package io.github.hulang1024.chinesechessserver.message.client.room;

import io.github.hulang1024.chinesechessserver.message.ClientMessage;
import lombok.Data;

@Data
public class RoomCreate extends ClientMessage {
    private String roomName;
}