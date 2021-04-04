import ChessK from "./ChessK";
import ChessHost from "../../chess_host";
import ChessboardState from "./ChessboardState";
import Game from "./Game";
import { findChessGoPoss } from "./move_rules";

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
   * @param chessHost
   */
  judge(checkHost: ChessHost, chessboardState: ChessboardState): boolean {
    const checkK = getKingChess(checkHost, chessboardState) as ChessK;

    return chessboardState.getChesses()
      .filter((chess) => chess.getHost() != checkHost)
      .find((chess) => (
        chess.isFront() && chess.canGoTo(checkK.getPos(), chessboardState, this.game)
      )) != null;
  }

  /**
   * 判断绝杀
   * 前置条件: 已经将军
   */
  judgeDie(checkHost: ChessHost, chessboardState: ChessboardState): boolean {
    // 被将军方是否不存在有走一步之后打破将军情况的走法
    return chessboardState.getChesses()
      .filter((chess) => chess.getHost() == checkHost)
      .find((chess) => {
        const foundPoss = findChessGoPoss(chess, this.game, chessboardState);
        return foundPoss.find((destPos) => {
          const nextChessboardState = chessboardState.clone();
          nextChessboardState.setChess(chess.getPos(), null);
          const newChess = chess.clone();
          newChess.setPos(destPos);
          nextChessboardState.setChess(destPos, newChess);
          return !this.judge(checkHost, nextChessboardState);
        }) != null;
      }) == null;
  }
}
