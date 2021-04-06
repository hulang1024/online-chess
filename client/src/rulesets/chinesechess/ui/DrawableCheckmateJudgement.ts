import { configManager } from "src/boot/main";
import { ConfigItem } from "src/config/ConfigManager";
import ChessHost from "src/rulesets/chess_host";
import GameAudio from "src/rulesets/GameAudio";
import './judgement.scss';

export default class DrawableCheckmateJudgement {
  public el: HTMLDivElement;

  public filterEl: HTMLDivElement;

  private timer: NodeJS.Timeout;

  constructor() {
    const el = document.createElement('div');
    el.className = `judgement checkmate-judgement absolute-center`;
    this.el = el;

    const filterEl = document.createElement('div');
    filterEl.classList.add('die-filter');
    document.body.appendChild(filterEl);
    this.filterEl = filterEl;
  }

  public show(actionChessHost: ChessHost, isDie = false) {
    clearTimeout(this.timer);

    if (isDie) {
      this.el.classList.add('die');
      this.toggleDieFilter(true);
      setTimeout(() => {
        this.toggleDieFilter(false);
      }, 2000);
    }
    this.el.classList.add('show');
    this.el.innerText = isDie ? '绝杀' : '将军!';
    this.timer = setTimeout(() => {
      this.el.classList.remove('show');
    }, isDie ? 2000 : 1000);
    setTimeout(() => {
      if (configManager.get(ConfigItem.chinesechessGameplayAudioEnabled)) {
        GameAudio.play(`games/chinesechess/default/checkmate${isDie ? '_die' : ''}`);
      }
    }, 0);
  }

  public destory() {
    (this.filterEl.parentElement as HTMLElement).removeChild(this.filterEl);
  }

  private toggleDieFilter(isShow: boolean) {
    this.filterEl.classList[isShow ? 'add' : 'remove']('show');
  }
}
