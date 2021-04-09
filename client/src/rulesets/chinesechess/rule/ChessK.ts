import ChessPos from "./ChessPos";
import Game from "./Game";
import AbstractChess from "./AbstractChess";
import { isInKingHome, isStraightLineMove, sign } from "./move_rules";
import ChessboardState from "./ChessboardState";

/**
 * 将
 */
export default class ChessK extends AbstractChess {
  /** 是否可走出九宫 */
  public canGoOutside = false;

  canGoTo(destPos: ChessPos, chessboardState: ChessboardState, game: Game): boolean {
    const rowOffset = destPos.row - this.pos.row;
    const colOffset = destPos.col - this.pos.col;

    // 如果走了大于一步，判断是不是吃碰面的对方将军
    if (Math.abs(rowOffset) > 1) {
      if (colOffset != 0 || !this.isEatOtherK(destPos, chessboardState)) {
        return false;
      }
      // 吃碰面的对方将军，中间不能有棋
      const k = sign(rowOffset);
      for (let row = this.pos.row + k; row != destPos.row; row += k) {
        if (!chessboardState.isEmpty(row, this.pos.col)) {
          return false;
        }
      }
      return true;
    }
    if (Math.abs(colOffset) > 1) {
      if (rowOffset != 0 || !this.isEatOtherK(destPos, chessboardState)) {
        return false;
      }
      const k = sign(colOffset);
      for (let col = this.pos.col + k; col != destPos.col; col += k) {
        if (!chessboardState.isEmpty(this.pos.row, col)) {
          return false;
        }
      }
      return true;
    }

    // 可以在九宫内走单步，不限制方向（不包括斜着走）
    return isStraightLineMove(rowOffset, colOffset, 1)
      && (this.canGoOutside || isInKingHome(this, destPos, game));
  }

  clone(): ChessK {
    const clone = new ChessK(this.pos, this.host);
    clone.front = this.front;
    return clone;
  }

  // eslint-disable-next-line
  private isEatOtherK(destPos: ChessPos, chessboardState: ChessboardState): boolean {
    const targetChess = chessboardState.chessAt(destPos);
    return targetChess ? targetChess.is(ChessK) : false;
  }
}
