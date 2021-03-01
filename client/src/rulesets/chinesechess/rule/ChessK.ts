import ChessPos from "./ChessPos";
import Game from "./Game";
import AbstractChess from "./AbstractChess";
import { isInKingHome, isStraightLineMove, sign } from "./move_rules";

/**
 * 将
 */
export default class ChessK extends AbstractChess {
  canGoTo(destPos: ChessPos, game: Game): boolean {
    const rowOffset = destPos.row - this.pos.row;
    const colOffset = destPos.col - this.pos.col;

    // 如果走了大于一步，判断是不是吃碰面的对方将军
    if (Math.abs(rowOffset) > 1) {
      const targetChess = game.getChessboard().chessAt(destPos);
      if (targetChess == null || !targetChess.is(ChessK)) {
        return false;
      }

      // 吃碰面的对方将军，中间不能有棋
      const k = sign(rowOffset);
      for (let row = this.pos.row + k; row != destPos.row; row += k) {
        if (!game.getChessboard().isEmpty(row, this.pos.col)) {
          return false;
        }
      }
      return true;
    }

    // 可以在九宫内走单步，不限制方向（不包括斜着走）
    return isStraightLineMove(rowOffset, colOffset, 1) && isInKingHome(this, destPos, game);
  }
}
