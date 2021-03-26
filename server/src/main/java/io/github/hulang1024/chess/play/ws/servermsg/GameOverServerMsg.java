package io.github.hulang1024.chess.play.ws.servermsg;

import io.github.hulang1024.chess.play.GameOverCause;
import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class GameOverServerMsg extends ServerMessage {
    private Long winUserId;

    private int cause;

    public GameOverServerMsg(Long winUserId, GameOverCause cause) {
      super("play.game_over");
      this.winUserId = winUserId;
      this.cause = cause.code();
    }
}