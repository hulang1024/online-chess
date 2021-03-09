import ChineseChessDarkRuleset from "./chinesechess-dark/ChineseChessDarkRuleset";
import ChineseChessRuleset from "./chinesechess/ChineseChessRuleset";
import { GameType } from "./GameType";
import GobangRuleset from "./gobang/GobangRuleset";
import Ruleset from "./Ruleset";

export default class RulesetFactory {
  public static create(ruleset: GameType): Ruleset | null {
    switch (ruleset) {
      case GameType.chinesechess:
        return new ChineseChessRuleset();
      case GameType.chinesechessDark:
        return new ChineseChessDarkRuleset();
      case GameType.gobang:
        return new GobangRuleset();
      default:
        return null;
    }
  }
}
