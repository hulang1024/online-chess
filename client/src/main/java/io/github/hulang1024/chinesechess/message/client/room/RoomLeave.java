package io.github.hulang1024.chinesechess.message.client.room;

import io.github.hulang1024.chinesechess.message.ClientMessage;
import lombok.Data;

@Data
public class RoomLeave extends ClientMessage {
  public RoomLeave() {
    super("room.leave");
  }
}