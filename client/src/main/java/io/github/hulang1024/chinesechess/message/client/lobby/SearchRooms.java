package io.github.hulang1024.chinesechess.message.client.lobby;

import io.github.hulang1024.chinesechess.message.ClientMessage;
import lombok.Data;

@Data
public class SearchRooms extends ClientMessage {
  public SearchRooms() {
    super("lobby.search_rooms");
  }
}