/**
 * 棋子位置
 */
interface IChessPos {
  row: number;
  col: number;
}

export default class ChessPos {
  /**
   * 棋盘纵坐标
   */
  readonly row: number;

  /**
   * 棋盘横坐标
   */
  readonly col: number;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
  }

  static make({ row, col }: IChessPos) {
    return new ChessPos(row, col);
  }

  copy() {
    return new ChessPos(this.row, this.col);
  }

  equals(that: ChessPos): boolean {
    return this.row == that.row && this.col == that.col;
  }
}
