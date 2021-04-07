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
    const chesses = this.game.chessboardState.getChesses();

    const canEat = (targetHost: ChessHost, asStatus: ChessStatus) => {
      chesses.forEach((target) => {
        if (target.getHost() == targetHost) {
          chesses.forEach((chess) => {
            if (chess.getHost() == targetHost || !this.game.canGoTo(chess, target.getPos())) {
              return;
            }
            if (target.is(ChessK)) {
              found.set(target, asStatus);
            } else {
              const testChessboardState = this.game.chessboardState.clone();
              testChessboardState.setChess(chess.getPos(), null);
              testChessboardState.setChess(target.getPos(), chess);
              if (!isProtectee(target, this.game, testChessboardState)) {
                found.set(target, asStatus);
              }
            }
          });
        }
      });
    };
    canEat(ChessHost.reverse(host), ChessStatus.eatable);
    canEat(host, ChessStatus.danger);
    return found;
  }
}
