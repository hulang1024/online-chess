package io.github.hulang1024.chinesechess.play.ws.servermsg;

import io.github.hulang1024.chinesechess.ws.ServerMessage;
import lombok.Data;

@Data
public class GameOverServerMsg extends ServerMessage {
    private Long winUserId;

    public GameOverServerMsg(Long winUserId) {
      super("play.game_over");
      this.winUserId = winUserId;
    }
}
