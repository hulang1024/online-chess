import ChessHost from "./chess_host";

/**
 * 棋子位置
 */
interface IChessPos {
  row: number;
  col: number;
}

export default class ChessPos {
  /**
   * 棋盘纵坐标，从0开始数，最大是9
   */
  readonly row: number;

  /**
   * 棋盘横坐标，从0开始数，最大是8
   */
  readonly col: number;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
  }

  static make({ row, col }: IChessPos) {
    return new ChessPos(row, col);
  }

  static reverseView(pos: IChessPos) {
    return this.make(pos).reverseView();
  }

  copy() {
    return new ChessPos(this.row, this.col);
  }

  /**
   * 将当前棋子位置（视为源视角棋方的棋子位置）转换为指定视角棋方的棋子位置
   * @param chessHost 源视角棋方
   * @param viewChessHost 指定视角棋方
   */
  convertViewPos(chessHost: ChessHost, viewChessHost: ChessHost) {
    return viewChessHost == chessHost ? this.copy() : ChessPos.reverseView(this);
  }

  /**
   * 翻转视角
   */
  reverseView() {
    return new ChessPos(9 - this.row, 8 - this.col);
  }

  equals(that: ChessPos): boolean {
    return this.row == that.row && this.col == that.col;
  }
}
