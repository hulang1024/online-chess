import ChessHost from 'src/rulesets/chess_host';
import ChessPos from 'src/rulesets/gobang/ChessPos';
import { ChessboardSizes } from './GobangDrawableChessboard';
import './chess.scss';

export default class DrawableChess {
  public el: HTMLElement;

  private _marked: boolean;

  public chess: ChessHost;

  public pos: ChessPos;

  constructor(chess: ChessHost, pos: ChessPos, sizes: ChessboardSizes) {
    this.chess = chess;
    this.pos = pos;

    const el = document.createElement('div');
    // 根据棋子类型设置类名
    el.className = `chess ${chess == ChessHost.FIRST ? 'black' : 'white'}`;
    this.el = el;

    this.resizeAndDraw(sizes);
  }

  public resizeAndDraw(sizes: ChessboardSizes) {
    const { el, pos } = this;
    const { cellSize, padding } = sizes;
    const gap = 6; // 棋子之间的间距
    const size = cellSize - gap;
    const chessRadius = Math.round(size / 2);
    // 计算宽高
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    // 计算位置
    el.style.top = `${pos.row * cellSize + padding - chessRadius}px`;
    el.style.left = `${pos.col * cellSize + padding - chessRadius}px`;
  }

  public appear() {
    setTimeout(() => {
      this.el.classList.add('appear');
    }, 0);
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
