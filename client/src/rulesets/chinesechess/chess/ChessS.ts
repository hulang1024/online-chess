import ChessPos from "../ChessPos";
import Game from "../Game";
import AbstractChess from "./AbstractChess";
import { isInBoundary } from "./move_rules";

/**
 * 兵
 */
export default class ChessS extends AbstractChess {
  canGoTo(destPos: ChessPos, game: Game): boolean {
    const rowOffset = destPos.row - this.pos.row;
    const colOffset = destPos.col - this.pos.col;

    // 是否向前单步
    const isForward = Math.abs(colOffset) == 0
      && (game.isHostAtChessboardTop(this.host) ? rowOffset == +1 : rowOffset == -1);

    // 判断是否过了河
    if (isInBoundary(game, this.host, destPos)) {
      // 过河之前只可以向前单步
      return isForward;
    }
    // 过河之后既可以向前单步，也可以左或右移单步
    return isForward || (Math.abs(rowOffset) == 0 && Math.abs(colOffset) == 1);
  }
}
