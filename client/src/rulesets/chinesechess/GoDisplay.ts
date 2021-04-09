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
    const otherChesses = chessboardState.getOtherChesses(originChess.getHost());

    const isDangerPos = (testPos: ChessPos) => {
      const testChessboardState = chessboardState.chessMovedClone(originChess, testPos);
      if (otherChesses.find((chess) => (
        this.game.canGoTo(chess, testPos, testChessboardState))) != null) {
        return true;
      }

      // 判断送将
      if (this.game.checkmateJudgement.judge(originChess.getHost(), testChessboardState)) {
        return true;
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
