import { configManager } from "src/boot/main";
import { ConfigItem } from "src/config/ConfigManager";
import ChineseChessGameRule from "./ChineseChessGameRule";
import { findChessGoPoss } from "./rule/move_rules";
import DrawableChess from "./ui/DrawableChess";
import GoPoint from "./ui/GoPoint";

export default class GoDisplay {
  private game: ChineseChessGameRule;

  private goPoints: GoPoint[] = [];

  constructor(game: ChineseChessGameRule) {
    this.game = game;
  }

  public update(chess: DrawableChess) {
    if (!configManager.get(ConfigItem.chinesechessGoDisplay)) {
      return;
    }
    this.clear();
    const { chessboard } = this.game;
    findChessGoPoss(chess, this.game, this.game.chessboardState).forEach((pos) => {
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
}
