package io.github.hulang1024.chess.play.ws.servermsg;

import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class GameOverServerMsg extends ServerMessage {
    private Long winUserId;

    /**
     * 正常结束，即不包括例如超时，和棋，认输等
     */
    private boolean isNormal;

    private boolean isTimeout;

    public GameOverServerMsg(Long winUserId, boolean isNormal, boolean isTimeout) {
      super("play.game_over");
      this.winUserId = winUserId;
      this.isNormal = isNormal;
      this.isTimeout = isTimeout;
    }
}