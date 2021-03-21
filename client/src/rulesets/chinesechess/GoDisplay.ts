import { configManager } from "src/boot/main";
import { ConfigItem } from "src/config/ConfigManager";
import ChineseChessGameRule from "./ChineseChessGameRule";
import ChessPos from "./rule/ChessPos";
import Game from "./rule/Game";
import DrawableChess from "./ui/DrawableChess";
import GoPoint from "./ui/GoPoint";

export default class GoDisplay {
  private game: ChineseChessGameRule;

  private goPoints: GoPoint[] = [];

  constructor(game: Game) {
    this.game = game as ChineseChessGameRule;
  }

  public update(chess: DrawableChess) {
    if (!configManager.get(ConfigItem.chinesechessGoDisplay)) {
      return;
    }
    this.clear();
    const chessboard = this.game.getChessboard();
    this.findGoPoss(chess).forEach((pos) => {
      const goPoint = new GoPoint(pos, chessboard);
      chessboard.el.appendChild(goPoint.el);
      this.goPoints.push(goPoint);
    });
  }

  public clear() {
    this.goPoints.forEach((goPoint) => {
      if (goPoint.el.parentElement) {
        goPoint.el.parentElement.removeChild(goPoint.el);
      }
    });
  }

  private findGoPoss(chess: DrawableChess): ChessPos[] {
    const found = [];
    const chessboard = this.game.getChessboard();
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        const dest = new ChessPos(row, col);
        if (!dest.equals(chess.getPos())
          && this.game.canGoTo(chess, dest)
          && (chessboard.isEmpty(row, col)
            || chessboard.chessAt(dest)?.getHost() != chess.getHost())) {
          found.push(dest);
        }
      }
    }
    return found;
  }
}
