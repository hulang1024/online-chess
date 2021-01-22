package io.github.hulang1024.chinesechess.play.ws.servermsg;

import io.github.hulang1024.chinesechess.ws.ServerMessage;
import lombok.Data;

@Data
public class GameOverServerMsg extends ServerMessage {
    private Long winUserId;

    private boolean isTimeout;

    public GameOverServerMsg(Long winUserId, boolean isTimeout) {
      super("play.game_over");
      this.winUserId = winUserId;
      this.isTimeout = isTimeout;
    }
}