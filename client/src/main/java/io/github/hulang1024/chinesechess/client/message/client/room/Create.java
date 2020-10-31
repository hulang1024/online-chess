package io.github.hulang1024.chinesechess.client.message.client.room;

import io.github.hulang1024.chinesechess.client.message.ClientMessage;
import lombok.Data;

@Data
public class Create extends ClientMessage {
    private String roomName;


    public Create() {
      super("room.create");
    }
}