package io.github.hulang1024.chess.play.ws.servermsg;

import io.github.hulang1024.chess.games.Game;
import io.github.hulang1024.chess.games.GameInitialStates;
import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 棋局开始
 * @author HuLang
 */
@Data
public class GameStartServerMsg extends ServerMessage {
    private List<UserHost> userHosts;
    private GameInitialStates initialStates;

    @Data
    public static class UserHost {
        private long uid;
        private int chess;
    }

    public GameStartServerMsg(Game game) {
      super("play.game_start");

      this.userHosts = game.getContext().getGameUsers().stream().map(gameUser -> {
          UserHost h = new UserHost();
          h.setUid(gameUser.getUser().getId());
          h.setChess(gameUser.getChess());
          return h;
      }).collect(Collectors.toList());

      this.initialStates = game.createGameInitialStatesResponse();
    }
}