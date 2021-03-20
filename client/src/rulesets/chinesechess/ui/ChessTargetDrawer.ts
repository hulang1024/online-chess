import DrawableChessboard from "./ChineseChessDrawableChessboard";
import ChessPos from "../rule/ChessPos";

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
    const size = Math.round((this.chessboard.bounds.chessRadius * 2) / 2.8);
    const { x, y } = this.chessboard.calcChessDisplayPos(pos);
    const el = document.createElement('div');
    el.className = 'chess-target';
    el.style.position = 'absolute';
    const radius = Math.floor(size / 2);
    el.style.left = `${x - radius}px`;
    el.style.top = `${y - radius}px`;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.setAttribute('chess-pos', `${pos.row},${pos.col}`);
    return el;
  }
}
