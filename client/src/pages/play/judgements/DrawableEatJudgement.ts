import Chess from "src/rule/Chess";
import ChessHost from "src/rule/chess_host";
import { chessClassToText } from "src/rule/chess_map";

export default class DrawableEatJudgement {
  public el: HTMLDivElement;

  private sub: HTMLDivElement;

  constructor() {
    const el = document.createElement('div');
    el.className = 'judgement eat-judgement absolute-center z-top';
    const title = document.createElement('div');
    title.className = 'title';
    title.innerText = '吃';
    el.appendChild(title);

    const sub = document.createElement('div');
    this.sub = sub;
    el.appendChild(sub);
    this.el = el;
  }

  public show(eatenChess: Chess) {
    const chessHostText = eatenChess?.getHost() == ChessHost.RED ? '红' : '黑';
    this.sub.innerText = `（${chessHostText}${chessClassToText(eatenChess)}被吃）`;
    this.el.style.display = 'block';
    this.el.classList.add('show');
    setTimeout(() => {
      this.el.classList.remove('show');
    }, 2000);
  }
}
