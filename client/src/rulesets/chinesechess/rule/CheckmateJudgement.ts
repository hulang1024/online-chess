import Chess from "./Chess";
import ChessK from "./ChessK";
import ChessHost from "../../chess_host";
import ChessboardState from "./ChessboardState";
import Game from "./Game";

export default class CheckmateJudgement {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  /**
   * 检查指定棋方此刻是否被将军
   * @param chessHost
   */
  judge(checkHost: ChessHost, chessboardState: ChessboardState): boolean {
    let checkK: Chess | null = null;
    chessboardState.getChesses().forEach((chess) => {
      if (!checkK && chess.is(ChessK)) {
        if (chess.getHost() == checkHost) {
          checkK = chess;
        }
      }
    });
    // 有可能上一步就被吃了，检查在不在
    if (checkK == null) {
      return false;
    }

    return chessboardState.getChesses()
      .filter((chess) => chess.getHost() != checkHost)
      .find((chess) => {
        // 是否可吃对方将军 todo: isFront是揭棋判断，待模块化
        if (chess.isFront()
          && chess.canGoTo((checkK as Chess).getPos(), chessboardState, this.game)) {
          return true;
        }
        return false;
      }) != null;
  }
}
