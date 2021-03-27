import RulesetPlayer from "../RulesetPlayer";
import ChineseChessGameRule from "./ChineseChessGameRule";
import ChineseChessUserPlayInput from "./ChineseChessUserPlayInput";
import Settings from './ui/Settings.vue';

export default class ChineseChessPlayer extends RulesetPlayer {
  // eslint-disable-next-line
  public openSettings() {
    this.context.$q.dialog({
      component: Settings,
    }).onOk(({ chessStatus, goDisplay }: { chessStatus: boolean, goDisplay: boolean }) => {
      if (chessStatus) {
        // eslint-disable-next-line
        (this.game as ChineseChessGameRule).chessStatusDisplay.update(this.game.viewChessHost);
      } else {
        (this.game as ChineseChessGameRule).chessStatusDisplay.clear();
      }

      const userPlayInput = this.userPlayInput as ChineseChessUserPlayInput;
      if (userPlayInput.goDisplay) {
        if (goDisplay) {
          if (userPlayInput.lastSelected) {
            userPlayInput.goDisplay.update(userPlayInput.lastSelected);
          }
        } else {
          userPlayInput.goDisplay.clear();
        }
      }
    });
  }

  // eslint-disable-next-line
  public openHelp() {
    window.open('https://baike.baidu.com/item/%E4%B8%AD%E5%9B%BD%E8%B1%A1%E6%A3%8B/278314');
  }
}
