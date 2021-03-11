import ChineseChessRuleset from "../chinesechess/ChineseChessRuleset";
import ChineseChessDarkGameRule from "./ChineseChessDarkGameRule";
import ChineseChessDarkPlayer from "./ChineseChessDarkPlayer";

export default class ChineseChessDarkRuleset extends ChineseChessRuleset {
  // eslint-disable-next-line
  public createGameRule() {
    return new ChineseChessDarkGameRule();
  }

  // eslint-disable-next-line
  public createPlayer() {
    return new ChineseChessDarkPlayer();
  }
}
