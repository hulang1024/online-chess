import { configManager } from "src/boot/main";
import { ConfigItem } from "src/config/ConfigManager";
import ChessHost from "src/rulesets/chess_host";
import GameAudio from "src/rulesets/GameAudio";
import './judgement.scss';

export default class DrawableCheckmateJudgement {
  public el: HTMLDivElement;

  private timer: NodeJS.Timeout;

  constructor() {
    const el = document.createElement('div');
    el.className = `judgement checkmate-judgement absolute-center`;
    this.el = el;
  }

  public show(actionChessHost: ChessHost, isDie = false) {
    clearTimeout(this.timer);

    const colorClass = actionChessHost == ChessHost.FIRST ? 'red' : 'black';
    if (isDie) {
      this.el.classList.add('die');
    }
    this.el.classList.add(colorClass, 'show');
    this.el.innerText = isDie ? '绝杀!' : '将军!';
    this.timer = setTimeout(() => {
      this.el.classList.remove(colorClass, 'show');
    }, 1000);
    if (configManager.get(ConfigItem.chinesechessGameplayAudioEnabled)) {
      GameAudio.play(`games/chinesechess/default/checkmate${isDie ? '_die' : ''}`);
    }
  }
}
