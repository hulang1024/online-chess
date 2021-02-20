package io.github.hulang1024.chess.play.ws.servermsg;

import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

/**
 * 棋局开始
 * @author HuLang
 */
@Data
public class GameStartServerMsg extends ServerMessage {
    private long firstChessUid;
    private long secondChessUid;

    public GameStartServerMsg(User firstChessUser, User secondChessUser) {
      super("play.game_start");
      this.firstChessUid = firstChessUser.getId();
      this.secondChessUid = secondChessUser.getId();
    }
}