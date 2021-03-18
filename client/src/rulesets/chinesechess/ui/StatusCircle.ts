import DrawableChessboard from "./ChineseChessDrawableChessboard";
import ChessPos from "../rule/ChessPos";

export enum ChessStatus {
  danger = 1,
  eatable = 2
}

export default class StatusCircle {
  public el: HTMLDivElement;

  constructor(status: ChessStatus, pos: ChessPos, chessboard: DrawableChessboard) {
    const radius = chessboard.bounds.chessRadius + 3;
    const size = radius * 2;
    const { x, y } = chessboard.calcChessDisplayPos(pos);
    const el = document.createElement('div');
    el.classList.add('status-circle',
      status == ChessStatus.danger ? 'danger' : 'eatable');
    el.style.left = `${x - radius}px`;
    el.style.top = `${y - radius}px`;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    this.el = el;
  }
}
