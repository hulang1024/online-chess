import ChessHost from '../chess_host';
import ChessPos from './ChessPos';

export const gridNumber = 15;

export default class Chessboard {
  private array: Array<Array<ChessHost | null>> = [];

  constructor() {
    this.clear();
  }

  public isEmpty(pos: ChessPos): boolean {
    return this.chessAt(pos) == null;
  }

  public chessAt(pos: ChessPos) {
    return this.array[pos.row][pos.col];
  }

  public setChess(pos: ChessPos, chess: ChessHost | null) {
    this.array[pos.row][pos.col] = chess;
  }

  public clear() {
    for (let row = 0; row < gridNumber; row++) {
      this.array.push(new Array(gridNumber));
      for (let col = 0; col < gridNumber; col++) {
        this.array[row][col] = null;
      }
    }
  }
}
