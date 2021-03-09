import ChineseChessRuleset from "../chinesechess/ChineseChessRuleset";
import ChineseChessDarkGameRule from "./ChineseChessDarkGameRule";

export default class ChineseChessDarkRuleset extends ChineseChessRuleset {
  // eslint-disable-next-line
  public createGameRule() {
    return new ChineseChessDarkGameRule();
  }
}
