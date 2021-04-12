import DrawableChessboard from "./ChineseChessDrawableChessboard";
import ChessPos from "../rule/ChessPos";
import './chess_target.scss';

export default class ChessTargetDrawer {
  private chessboard: DrawableChessboard;

  private target: HTMLElement | null;

  private pos: ChessPos | null;

  private canClear = false;

  constructor(chessboard: DrawableChessboard) {
    this.chessboard = chessboard;
  }

  draw(pos: ChessPos) {
    this.pos = pos;
    this.clear();
    const target = this.makeTarget(pos);
    this.target = target;
    this.chessboard.el.appendChild(target);
    this.canClear = true;
  }

  getSavePos(): ChessPos {
    return this.pos as ChessPos;
  }

  clear(posToClear = false) {
    if (this.canClear) {
      this.chessboard.el.removeChild(this.target as Node);
      this.target = null;
      this.canClear = false;
      if (posToClear) {
        this.pos = null;
      }
    }
  }

  private makeTarget(pos: ChessPos): HTMLElement {
    const radius = this.chessboard.bounds.chessRadius * 0.5;
    const { x, y } = this.chessboard.calcChessDisplayPos(pos);
    const el = document.createElement('div');
    el.className = 'chess-target';
    const size = radius * 2;
    el.style.left = `${x - radius}px`;
    el.style.top = `${y - radius}px`;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.setAttribute('chess-pos', `${pos.row},${pos.col}`);

    const center = document.createElement('div');
    center.style.width = `${Math.round(size / 2.1)}px`;
    center.style.height = `${Math.round(size / 2.1)}px`;
    el.appendChild(center);
    return el;
  }
}
