import { configManager } from "src/boot/main";
import { ConfigItem } from "src/config/ConfigManager";
import ChineseChessGameRule from "./ChineseChessGameRule";
import { findChessGoPoss } from "./rule/alg";
import ChessPos from "./rule/ChessPos";
import DrawableChess from "./ui/DrawableChess";
import GoPoint from "./ui/GoPoint";

export default class GoDisplay {
  private game: ChineseChessGameRule;

  private goPoints: GoPoint[] = [];

  constructor(game: ChineseChessGameRule) {
    this.game = game;
  }

  public update(originChess: DrawableChess) {
    if (!configManager.get(ConfigItem.chinesechessGoDisplay)) {
      return;
    }
    this.clear();
    const { chessboard, chessboardState } = this.game;
    const otherChesses = chessboardState.getChesses()
      .filter((c) => c.getHost() != originChess.getHost());
    const isDangerPos = (testPos: ChessPos) => {
      for (let i = 0; i < otherChesses.length; i++) {
        const otherChess = otherChesses[i];
        const testChessboardState = chessboardState.clone();
        testChessboardState.setChess(originChess.getPos(), null);
        testChessboardState.setChess(testPos, originChess);
        if (this.game.canGoTo(otherChess, testPos, testChessboardState)) {
          return true;
        }
      }
      return false;
    };
    findChessGoPoss(originChess, this.game, chessboardState).forEach((pos) => {
      const goPoint = new GoPoint(pos, isDangerPos(pos), chessboard);
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
