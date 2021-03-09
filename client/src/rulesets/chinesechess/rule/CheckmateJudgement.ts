import Chess from "./Chess";
import ChessK from "./ChessK";
import ChessHost from "../../chess_host";
import Game from "./Game";

export default class CheckmateJudgement {
  private game: Game;

  private redK: Chess;

  private blackK: Chess;

  constructor(game: Game) {
    this.game = game;

    this.game.getChessboard().getChessList().forEach((chess) => {
      if (chess.is(ChessK)) {
        if (chess.getHost() == ChessHost.FIRST) {
          this.redK = chess;
        } else {
          this.blackK = chess;
        }
      }
    });
  }

  /**
   * 检查指定棋方此刻是否被将军
   * @param chessHost
   */
  judge(checkHost: ChessHost): boolean {
    const checkKPos = (checkHost == ChessHost.FIRST ? this.redK : this.blackK).getPos();

    // 有可能上一步就被吃了，检查在不在
    const chessK = this.game.getChessboard().chessAt(checkKPos);
    if (chessK == null || !chessK.is(ChessK)) {
      return false;
    }

    return this.game.getChessboard().getChessList()
      .filter((chess) => chess.getHost() != checkHost)
      .find((chess) => {
        // 排除将碰面
        if (chess.is(ChessK)) {
          return false;
        }
        // 是否可吃对方将军 todo: isFront是揭棋判断，待模块化
        if (chess.isFront() && chess.canGoTo(checkKPos, this.game)) {
          return true;
        }
        return false;
      }) != null;
  }
}
