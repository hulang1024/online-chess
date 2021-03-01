import ChessPos from "./ChessPos";
import Game from "./Game";
import AbstractChess from "./AbstractChess";
import { MAX_DISTANCE, isStraightLineMove, sign } from "./move_rules";

/**
 * 车
 */
export default class ChessR extends AbstractChess {
  canGoTo(destPos: ChessPos, game: Game): boolean {
    const rowOffset = destPos.row - this.pos.row;
    const colOffset = destPos.col - this.pos.col;

    // 进退都可以，但必须直线走
    if (!isStraightLineMove(rowOffset, colOffset, MAX_DISTANCE)) {
      return false;
    }

    // 只要到目标位置之间没有棋子
    if (Math.abs(rowOffset) > 0) {
      const k = sign(rowOffset);
      for (let row = this.pos.row + k; row != destPos.row; row += k) {
        if (!game.getChessboard().isEmpty(row, this.pos.col)) {
          return false;
        }
      }
    } else {
      const k = sign(colOffset);
      for (let col = this.pos.col + k; col != destPos.col; col += k) {
        if (!game.getChessboard().isEmpty(this.pos.row, col)) {
          return false;
        }
      }
    }

    return true;
  }
}
