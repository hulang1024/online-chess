package io.github.hulang1024.chess.play.ws.servermsg;

import io.github.hulang1024.chess.play.GameOverCause;
import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class GameOverServerMsg extends ServerMessage {
    private int winHost;

    private int cause;

    public GameOverServerMsg(int winHost, GameOverCause cause) {
      super("play.game_over");
      this.winHost = winHost;
      this.cause = cause.code();
    }
}