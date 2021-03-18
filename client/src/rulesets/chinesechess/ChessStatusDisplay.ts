import ChessHost from "../chess_host";
import Chess from "./rule/Chess";
import Game from "./rule/Game";
import ChineseChessDrawableChessboard from "./ui/ChineseChessDrawableChessboard";
import StatusCircle, { ChessStatus } from './ui/StatusCircle';

export default class ChessStatusDisplay {
  private game: Game;

  private statusCircles: StatusCircle[] = [];

  constructor(game: Game) {
    this.game = game;
  }

  public update(host: ChessHost) {
    const chessStatusMap = this.findChessStatusMap(host);
    const chessboard = this.game.getChessboard() as ChineseChessDrawableChessboard;
    this.clear();
    chessStatusMap.forEach((status, chess) => {
      const statusCircle = new StatusCircle(status, chess.getPos(), chessboard);
      this.statusCircles.push(statusCircle);
      chessboard.el.appendChild(statusCircle.el);
    });
  }

  public clear() {
    this.statusCircles.forEach((statusCircle) => {
      if (statusCircle.el.parentElement) {
        statusCircle.el.parentElement.removeChild(statusCircle.el);
      }
    });
  }

  public findChessStatusMap(host: ChessHost): Map<Chess, ChessStatus> {
    const found = new Map<Chess, ChessStatus>();
    const chesses = this.game.getChessboard().getChessList();

    const isProtectee = (target: Chess) => {
      for (let i = 0; i < chesses.length; i++) {
        const chess = chesses[i];
        if (chess != target && chess.getHost() == target.getHost()
          && chess.isFront()
          && chess.canGoTo(target.getPos(), this.game)) {
          return true;
        }
      }
      return false;
    };

    const canEat = (targetHost: ChessHost, asStatus: ChessStatus) => {
      chesses.forEach((target) => {
        if (target.getHost() == targetHost && !isProtectee(target)) {
          chesses.forEach((chess) => {
            if (chess.getHost() != targetHost
              && chess.isFront()
              && chess.canGoTo(target.getPos(), this.game)) {
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
