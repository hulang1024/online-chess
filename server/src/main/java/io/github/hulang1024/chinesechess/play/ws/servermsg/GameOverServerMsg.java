package io.github.hulang1024.chinesechess.play.ws.servermsg;

import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.ws.ServerMessage;
import lombok.Data;

/**
 * 棋局开始
 * @author HuLang
 */
@Data
public class GameOverServerMsg extends ServerMessage {
    private long redChessUid;
    private long blackChessUid;

    public GameOverServerMsg(User redChessUser, User blackChessUser) {
      super("play.game_start");
      this.redChessUid = redChessUser.getId();
      this.blackChessUid = blackChessUser.getId();
    }
}
