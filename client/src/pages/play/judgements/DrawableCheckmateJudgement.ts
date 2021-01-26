import ChessHost from "src/rule/chess_host";

export default class DrawableCheckmateJudgement {
  public el: HTMLDivElement;

  constructor() {
    const el = document.createElement('div');
    el.className = `judgement checkmate-judgement absolute-center z-top`;
    el.innerText = '将军!';
    this.el = el;
  }

  public show(actionChessHost: ChessHost) {
    this.el.style.display = 'block';
    const colorClass = actionChessHost == ChessHost.RED ? 'red' : 'black';
    this.el.classList.add(colorClass, 'show');
    setTimeout(() => {
      this.el.classList.remove(colorClass, 'show');
    }, 2000);
  }
}
