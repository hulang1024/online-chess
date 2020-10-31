package io.github.hulang1024.chinesechessserver.message.client.room;

import io.github.hulang1024.chinesechessserver.message.ClientMessage;
import lombok.Data;

@Data
public class Create extends ClientMessage {
    private String roomName;
}