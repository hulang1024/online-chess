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

  constructor(chessboard: DrawableChessboard) {
    this.chessboard = chessboard;
    const radius = chessboard.bounds.chessRadius + 2;
    const size = radius * 2;
    const el = document.createElement('div');
    el.classList.add('status-circle');
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    this.el = el;
  }

  public draw(status: ChessStatus, pos: ChessPos) {
    const { el } = this;
    const { x, y } = this.chessboard.calcChessDisplayPos(pos);
    const radius = this.chessboard.bounds.chessRadius + 2;
    el.style.left = `${x - radius}px`;
    el.style.top = `${y - radius}px`;
    this.el.classList.add(status == ChessStatus.danger ? 'danger' : 'eatable', 'show');
  }

  public hide() {
    this.el.classList.remove('show');
  }
}
