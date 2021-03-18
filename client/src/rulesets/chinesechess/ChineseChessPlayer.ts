import { configManager } from "src/boot/main";
import { ConfigItem } from "src/config/ConfigManager";
import RulesetPlayer from "../RulesetPlayer";
import ChineseChessGameRule from "./ChineseChessGameRule";

export default class ChineseChessPlayer extends RulesetPlayer {
  // eslint-disable-next-line
  public openSettings() {
    this.context.$q.dialog({
      title: '设置',
      options: {
        type: 'toggle',
        model: configManager.get(ConfigItem.chinesechessChessStatus) as string,
        items: [
          { label: '提示' },
        ],
      },
      ok: {
        label: '确定',
        color: 'primary',
      },
      cancel: {
        label: '取消',
        color: 'warning',
      },
    }).onOk((value: boolean) => {
      configManager.set(ConfigItem.chinesechessChessStatus, value);
      configManager.save();

      if (value) {
        (this.game as ChineseChessGameRule).chessStatusDisplay.update(this.game.viewChessHost);
      } else {
        (this.game as ChineseChessGameRule).chessStatusDisplay.clear();
      }
    });
  }

  // eslint-disable-next-line
  public openHelp() {
    window.open('https://baike.baidu.com/item/%E4%B8%AD%E5%9B%BD%E8%B1%A1%E6%A3%8B/278314');
  }
}
