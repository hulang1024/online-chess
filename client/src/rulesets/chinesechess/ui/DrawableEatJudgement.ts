import Chess from "src/rulesets/chinesechess/rule/Chess";
import './judgement.scss';

const TRANSITION_DURATION = 100;

export default class DrawableEatJudgement {
  public el: HTMLDivElement;

  private timer: NodeJS.Timeout | null;

  constructor() {
    const el = document.createElement('div');
    el.className = 'judgement eat-judgement absolute-center';
    el.innerText = '吃';
    this.el = el;
  }

  public show(eatenChess: Chess) {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
      this.el.classList.remove('show');
      setTimeout(() => this.show(eatenChess), TRANSITION_DURATION);
      return;
    }

    this.el.classList.add('show');
    this.timer = setTimeout(() => {
      this.el.classList.remove('show');
      this.timer = null;
    }, 1000);
  }
}
