import ChineseChessPlayer from "../chinesechess/ChineseChessPlayer";
import Help from './Help.vue';

export default class ChineseChessDarkPlayer extends ChineseChessPlayer {
  // eslint-disable-next-line
  public openHelp() {
    this.context.$q.dialog({
      component: Help,
    });
  }
}
