import Chess from "./Chess";
import ChessPos from "./ChessPos";

export default class ChessboardState {
  private chessArray: Array<Array<Chess | null>>;

  constructor() {
    // eslint-disable-next-line
    this.chessArray = new Array(10);
    for (let row = 0; row < 10; row++) {
      // eslint-disable-next-line
      this.chessArray[row] = new Array(9);
      for (let col = 0; col < 9; col++) {
        // eslint-disable-next-line
        this.chessArray[row][col] = null;
      }
    }
  }

  public clear() {
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        this.chessArray[row][col] = null;
      }
    }
  }

  public clone() {
    const clone = new ChessboardState();
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        clone.chessArray[row][col] = this.chessArray[row][col];
      }
    }
    return clone;
  }

  public isEmpty(row: number, col: number): boolean {
    return this.chessArray[row][col] == null;
  }

  public setChess(pos: ChessPos, chess: Chess | null) {
    this.chessArray[pos.row][pos.col] = chess;
  }

  public removeChess(pos: ChessPos) {
    this.setChess(pos, null);
  }

  public chessAt(pos: ChessPos): Chess | null {
    return this.chessArray[pos.row][pos.col];
  }

  public getChesses(): Array<Chess> {
    const ret: Array<Chess> = [];
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        if (!this.isEmpty(row, col)) {
          ret.push(this.chessArray[row][col] as Chess);
        }
      }
    }
    return ret;
  }
}
