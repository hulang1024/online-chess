import DrawableChessboard from "./ChineseChessDrawableChessboard";
import ChessPos from "../rule/ChessPos";
import './go_point.scss';

export default class GoPoint {
  public el: HTMLDivElement;

  constructor(pos: ChessPos, chessboard: DrawableChessboard) {
    const radius = chessboard.bounds.chessRadius + 4;
    const size = radius * 2;
    const el = document.createElement('div');
    el.classList.add('go-point');
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    const { x, y } = chessboard.calcChessDisplayPos(pos);
    el.style.left = `${x - radius}px`;
    el.style.top = `${y - radius}px`;
    this.el = el;
  }
}
