import ChineseChessRuleset from "../chinesechess/ChineseChessRuleset";
import ChineseChessDarkGameRule from "./ChineseChessDarkGameRule";
import ChineseChessDarkGameSettings from "./ChineseChessDarkGameSettings";
import ChineseChessDarkPlayer from "./ChineseChessDarkPlayer";

export default class ChineseChessDarkRuleset extends ChineseChessRuleset {
  // eslint-disable-next-line
  public createGameRule() {
    return new ChineseChessDarkGameRule(this.gameSettings as ChineseChessDarkGameSettings);
  }

  // eslint-disable-next-line
  public createPlayer() {
    return new ChineseChessDarkPlayer();
  }
}
