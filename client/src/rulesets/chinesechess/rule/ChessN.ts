import ChessPos from "./ChessPos";
import AbstractChess from "./AbstractChess";
import { sign } from "./move_rules";
import ChessboardState from "./ChessboardState";

/**
 * 马
 */
export default class ChessN extends AbstractChess {
  canGoTo(destPos: ChessPos, chessboardState: ChessboardState): boolean {
    // 马走“日”，蹩马腿
    const rowOffset = destPos.row - this.pos.row;
    const colOffset = destPos.col - this.pos.col;

    if (Math.abs(rowOffset) == 2 && Math.abs(colOffset) == 1) {
      return chessboardState.isEmpty(this.pos.row + sign(rowOffset), this.pos.col);
    }
    if (Math.abs(rowOffset) == 1 && Math.abs(colOffset) == 2) {
      return chessboardState.isEmpty(this.pos.row, this.pos.col + sign(colOffset));
    }
    return false;
  }

  clone(): ChessN {
    const clone = new ChessN(this.pos, this.host);
    clone.front = this.front;
    return clone;
  }
}
