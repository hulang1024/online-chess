import ChessHost from "../chess_host";
import ChineseChessGameRule from "./ChineseChessGameRule";
import { isProtectee } from "./rule/alg";
import Chess from "./rule/Chess";
import ChessK from "./rule/ChessK";
import { ChessStatus } from './ui/StatusCircle';
import StatusCirclePool from "./ui/StatusCirclePool";

export default class ChessStatusDisplay {
  private game: ChineseChessGameRule;

  private statusCirclePool: StatusCirclePool;

  constructor(game: ChineseChessGameRule) {
    this.game = game;

    this.statusCirclePool = new StatusCirclePool(this.game.chessboard);
  }

  public async update(host: ChessHost) {
    // 多动画同步
    await Promise.all(this.clear());
    const chessStatusMap = this.findChessStatusMap(host);
    chessStatusMap.forEach((status, chess) => {
      const statusCircle = this.statusCirclePool.getNotUsed();
      this.statusCirclePool.markAsUsed(statusCircle, true);
      statusCircle.draw(status, chess.getPos());
      statusCircle.play();
    });
  }

  public clear() {
    const promises: Promise<void>[] = [];
    this.statusCirclePool.getUsedArray().forEach((statusCircle) => {
      this.statusCirclePool.markAsUsed(statusCircle, false);
      // eslint-disable-next-line
      promises.push(statusCircle.stop());
    });
    return promises;
  }

  private findChessStatusMap(host: ChessHost): Map<Chess, ChessStatus> {
    const found = new Map<Chess, ChessStatus>();
    const { chessboardState } = this.game;
    const canEat = (targetHost: ChessHost, asStatus: ChessStatus) => {
      chessboardState.getChesses(targetHost).forEach((target) => {
        chessboardState.getOtherChesses(targetHost).forEach((killer) => {
          if (this.game.canGoTo(killer, target.getPos())) {
            if (target.is(ChessK)) {
              found.set(target, asStatus);
            } else {
              const testChessboardState = chessboardState.chessMovedClone(killer, target.getPos());
              if (!isProtectee(target, this.game, testChessboardState)) {
                // 吃掉对方本方不会送将
                if (!this.game.checkmateJudgement.judge(killer.getHost(), testChessboardState)) {
                  found.set(target, asStatus);
                }
              }
            }
          }
        });
      });
    };
    canEat(ChessHost.reverse(host), ChessStatus.eatable);
    canEat(host, ChessStatus.danger);
    return found;
  }
}
