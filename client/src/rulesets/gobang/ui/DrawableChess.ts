import ChessHost from 'src/rulesets/chess_host';
import ChessPos from 'src/rulesets/gobang/ChessPos';
import { ChessboardSizes } from './GobangDrawableChessboard';
import './chess.scss';

export function calcChessSize(sizes: ChessboardSizes) {
  const gap = 3; // 棋子之间的间距
  return sizes.cellSize - gap;
}

export function calcChessDisplayPos(row: number, col: number, sizes: ChessboardSizes) {
  const { cellSize, padding } = sizes;
  const chessRadius = Math.round(calcChessSize(sizes) / 2);

  return {
    top: row * cellSize + padding - chessRadius,
    left: col * cellSize + padding - chessRadius,
  };
}

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

    const size = calcChessSize(sizes);
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    const displayPos = calcChessDisplayPos(this.pos.row, this.pos.col, sizes);
    el.style.top = `${displayPos.top}px`;
    el.style.left = `${displayPos.left}px`;

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
