import ChessPos from "./ChessPos";
import Game from "./Game";
import AbstractChess from "./AbstractChess";
import { MAX_DISTANCE, isStraightLineMove, sign } from "./move_rules";

/**
 * 炮
 */
export default class ChessC extends AbstractChess {
  canGoTo(destPos: ChessPos, game: Game): boolean {
    const rowOffset = destPos.row - this.pos.row;
    const colOffset = destPos.col - this.pos.col;

    // 必须直线走
    if (!isStraightLineMove(rowOffset, colOffset, MAX_DISTANCE)) {
      return false;
    }

    // 到目标位置之间的存在的棋子数量
    let chessCount = 0;
    if (Math.abs(rowOffset) > 0) {
      const k = sign(rowOffset);
      for (let row = this.pos.row + k; row != destPos.row + k; row += k) {
        if (!game.getChessboard().isEmpty(row, this.pos.col)) {
          chessCount++;
        }
      }
    } else {
      const k = sign(colOffset);
      for (let col = this.pos.col + k; col != destPos.col + k; col += k) {
        if (!game.getChessboard().isEmpty(this.pos.row, col)) {
          chessCount++;
        }
      }
    }

    return game.getChessboard().isEmpty(destPos.row, destPos.col)
      // 如果目标位置上无棋子，那么到目标位置之间必须没有棋子
      ? chessCount == 0
      // 否则，是准备吃子，则中间必选有且只有一个棋子（为2是因为目标棋子被计入）
      : chessCount == 2;
  }
}
