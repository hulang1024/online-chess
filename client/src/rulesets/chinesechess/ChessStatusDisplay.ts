import ChessHost from "../chess_host";
import ChineseChessGameRule from "./ChineseChessGameRule";
import Chess from "./rule/Chess";
import ChessK from "./rule/ChessK";
import Game from "./rule/Game";
import { ChessStatus } from './ui/StatusCircle';
import StatusCirclePool from "./ui/StatusCirclePool";

export default class ChessStatusDisplay {
  private game: ChineseChessGameRule;

  private statusCirclePool: StatusCirclePool;

  constructor(game: Game) {
    this.game = game as ChineseChessGameRule;

    this.statusCirclePool = new StatusCirclePool(this.game.getChessboard());
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

  public findChessStatusMap(host: ChessHost): Map<Chess, ChessStatus> {
    const found = new Map<Chess, ChessStatus>();
    const chesses = this.game.getChessboard().getChessList();

    const isProtectee = (target: Chess) => {
      for (let i = 0; i < chesses.length; i++) {
        const chess = chesses[i];
        if (chess != target && chess.getHost() == target.getHost()
          && this.game.canGoTo(chess, target.getPos())) {
          return true;
        }
      }
      return false;
    };

    const canEat = (targetHost: ChessHost, asStatus: ChessStatus) => {
      chesses.forEach((target) => {
        if (target.getHost() == targetHost
          && (target.is(ChessK) || !isProtectee(target))) {
          chesses.forEach((chess) => {
            if (chess.getHost() != targetHost
              && this.game.canGoTo(chess, target.getPos())) {
              found.set(target, asStatus);
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
