import ChessHost from "src/rulesets/chess_host";
import './judgement.scss';

const TRANSITION_DURATION = 200;

export default class DrawableCheckmateJudgement {
  public el: HTMLDivElement;

  private timer: NodeJS.Timeout;

  constructor() {
    const el = document.createElement('div');
    el.className = `judgement checkmate-judgement absolute-center z-top`;
    el.innerText = '将军!';
    this.el = el;
  }

  public show(actionChessHost: ChessHost) {
    clearTimeout(this.timer);

    this.el.style.display = 'block';
    setTimeout(() => {
      const colorClass = actionChessHost == ChessHost.FIRST ? 'red' : 'black';
      this.el.classList.add(colorClass, 'show');
      this.timer = setTimeout(() => {
        this.el.classList.remove(colorClass, 'show');
        setTimeout(() => {
          this.el.style.display = 'none';
        }, TRANSITION_DURATION + 50);
      }, 2000);
    }, 100);
  }
}
