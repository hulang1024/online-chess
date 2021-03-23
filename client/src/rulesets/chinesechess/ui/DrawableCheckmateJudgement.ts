import ChessHost from "src/rulesets/chess_host";
import './judgement.scss';

export default class DrawableCheckmateJudgement {
  public el: HTMLDivElement;

  private timer: NodeJS.Timeout;

  constructor() {
    const el = document.createElement('div');
    el.className = `judgement checkmate-judgement absolute-center`;
    el.innerText = '将军!';
    this.el = el;
  }

  public show(actionChessHost: ChessHost) {
    clearTimeout(this.timer);

    const colorClass = actionChessHost == ChessHost.FIRST ? 'red' : 'black';
    this.el.classList.add(colorClass, 'show');
    this.timer = setTimeout(() => {
      this.el.classList.remove(colorClass, 'show');
    }, 1000);
  }
}
