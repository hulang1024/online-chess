import ChessHost from 'src/rulesets/chess_host';
import ChessPos from 'src/rulesets/gobang/ChessPos';
import GobangDrawableChessboard from './GobangDrawableChessboard';
import { calcChessDisplayPos, calcChessSize } from './DrawableChess';
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
    const size = calcChessSize(this.chessboard.sizes);
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    const displayPos = calcChessDisplayPos(pos.row, pos.col, this.chessboard.sizes);
    el.style.top = `${displayPos.top}px`;
    el.style.left = `${displayPos.left}px`;
  }

  public hide() {
    this.el.classList.remove('show');
  }
}
