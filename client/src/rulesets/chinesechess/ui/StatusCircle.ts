import DrawableChessboard from "./ChineseChessDrawableChessboard";
import ChessPos from "../rule/ChessPos";
import './status_circle.scss';

export enum ChessStatus {
  danger = 1,
  eatable = 2
}

export default class StatusCircle {
  public el: HTMLDivElement;

  public chessboard: DrawableChessboard;

  private radius: number;

  private onAnimationCancel: () => void;

  constructor(chessboard: DrawableChessboard) {
    this.chessboard = chessboard;
    this.radius = chessboard.bounds.chessRadius + 3;
    const size = this.radius * 2;
    const el = document.createElement('div');
    el.classList.add('status-circle');
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    this.el = el;
  }

  public draw(status: ChessStatus, pos: ChessPos) {
    const { el } = this;
    const { x, y } = this.chessboard.calcChessDisplayPos(pos);
    el.style.left = `${x - this.radius}px`;
    el.style.top = `${y - this.radius}px`;
    this.el.classList.remove('danger', 'eatable');
    this.el.classList.add(status == ChessStatus.danger ? 'danger' : 'eatable');
  }

  public play() {
    this.el.classList.add('show', 'play');
  }

  public stop(): Promise<void> {
    this.el.classList.remove('show', 'play');
    this.el.removeEventListener('animationcancel', this.onAnimationCancel);
    return new Promise((resolve) => {
      this.el.addEventListener('animationcancel', this.onAnimationCancel = () => {
        resolve();
      });
    });
  }
}
