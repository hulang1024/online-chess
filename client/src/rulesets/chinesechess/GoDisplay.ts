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
    const isDangerPos = (testPos: ChessPos) => {
      const testChessboardState = chessboardState.chessMovedClone(originChess, testPos);
      if (testChessboardState.getOtherChesses(originChess.getHost()).find((killer) => (
        this.game.canGoTo(killer, testPos, testChessboardState))) != null) {
        return true;
      }

      // 判断送将
      if (this.game.checkmateJudgement.judge(originChess.getHost(), testChessboardState)) {
        return true;
      }

      return false;
    };

    setTimeout(() => {
      const goPoints = document.createDocumentFragment();
      findChessGoPoss(originChess, this.game, chessboardState).forEach((pos) => {
        const goPoint = new GoPoint(pos, isDangerPos(pos), chessboard);
        goPoints.appendChild(goPoint.el);
        this.goPoints.push(goPoint);
      });
      chessboard.el.appendChild(goPoints);
    }, 0);
  }

  public clear() {
    setTimeout(() => {
      this.goPoints.forEach((goPoint) => {
        if (goPoint.el.parentElement) {
          goPoint.el.parentElement.removeChild(goPoint.el);
        }
      });
    }, 0);
  }
}
