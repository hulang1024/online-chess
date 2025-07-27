import ChessHost from 'src/rulesets/chess_host';
import ChessPos from 'src/rulesets/gobang/ChessPos';
import { ChessboardSizes } from 'src/rulesets/gobang/ui/GobangDrawableChessboard';
import './chess.scss';

export default class DrawableChess {
  public el: HTMLElement;

  private _marked: boolean;

  public chess: ChessHost;

  public pos: ChessPos;

  constructor() {
    const el = document.createElement('div');
    el.classList.add('chess');

    this.el = el;
  }

  public draw(sizes: ChessboardSizes) {
    const { el, chess } = this;

    el.classList.add(chess == ChessHost.FIRST ? 'black' : 'white');

    const { cellSize, gridStart } = sizes;
    const size = sizes.cellSize - sizes.gap;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    const chessRadius = Math.round(size / 2);
    el.style.top = `${this.pos.row * cellSize + gridStart - chessRadius}px`;
    el.style.left = `${this.pos.col * cellSize + gridStart - chessRadius}px`;

    this.el.classList.add('appear');
  }

  public get marked() {
    return this._marked;
  }

  public set marked(val: boolean) {
    if (this._marked == val) return;
    this._marked = val;
    this.el.classList[val ? 'add' : 'remove']('marked');
  }
}
