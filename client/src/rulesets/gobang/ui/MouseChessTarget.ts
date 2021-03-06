import ChessHost from 'src/rulesets/chess_host';
import ChessPos from 'src/rulesets/gobang/ChessPos';
import GobangDrawableChessboard from './GobangDrawableChessboard';
import './chess.scss';

export default class MouseChessTarget {
  private el: HTMLElement;

  private chessboard: GobangDrawableChessboard;

  constructor(chessboard: GobangDrawableChessboard) {
    this.chessboard = chessboard;

    const el = document.createElement('div');
    el.classList.add('chess-target');

    this.el = el;

    this.chessboard.el.appendChild(el);
  }

  public setChess(chess: ChessHost) {
    const { classList } = this.el;
    classList.remove('white', 'black');
    classList.add(chess == ChessHost.FIRST ? 'black' : 'white');
  }

  public show(pos: ChessPos) {
    const { el } = this;

    el.classList.add('show');

    const { cellSize, gridStart } = this.chessboard.sizes;
    const cellRadius = Math.round(cellSize / 2);
    el.style.width = `${cellSize}px`;
    el.style.height = `${cellSize}px`;
    el.style.top = `${pos.row * cellSize + gridStart - cellRadius}px`;
    el.style.left = `${pos.col * cellSize + gridStart - cellRadius}px`;
  }

  public hide() {
    this.el.classList.remove('show');
  }
}
