import ChessK from "./ChessK";
import ChessHost from "../../chess_host";
import ChessboardState from "./ChessboardState";
import Game from "./Game";
import { findChessGoPoss } from "./alg";

function getKingChess(host: ChessHost, chessboardState: ChessboardState): ChessK | null {
  let chessK: ChessK | null = null;
  chessboardState.getChesses().forEach((chess) => {
    if (!chessK && chess.is(ChessK)) {
      if (chess.getHost() == host) {
        chessK = chess as ChessK;
      }
    }
  });
  return chessK;
}

export default class CheckmateJudgement {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  /**
   * 检查指定棋方此刻是否被将军
   * @param targetHost
   */
  judge(targetHost: ChessHost, chessboardState: ChessboardState): boolean {
    const checkK = getKingChess(targetHost, chessboardState) as ChessK;
    if (checkK == null || !checkK.isFront()) {
      return false;
    }
    return chessboardState.getOtherChesses(targetHost).find((killer) => (
      this.game.canGoTo(killer, checkK.getPos(), chessboardState)
    )) != null;
  }

  /**
   * 判断绝杀
   * 前置条件: 已经将军
   */
  judgeDie(checkHost: ChessHost, chessboardState: ChessboardState): boolean {
    // 被将军方是否不存在有走一步之后打破将军情况的走法
    return chessboardState.getChesses(checkHost).find((chess) => {
      const foundPoss = findChessGoPoss(chess, this.game, chessboardState);
      return foundPoss.find((destPos) => {
        const nextChessboardState = chessboardState.chessMovedClone(chess, destPos);
        return !this.judge(checkHost, nextChessboardState);
      }) != null;
    }) == null;
  }
}
