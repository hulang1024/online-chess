import ChessPos from "./ChessPos";
import Game from "./Game";
import AbstractChess from "./AbstractChess";
import { isInBoundary, sign } from "./move_rules";
import ChessboardState from "./ChessboardState";

/**
 * 象
 */
export default class ChessM extends AbstractChess {
  /** 是否可过河 */
  public canCrossBoundary = false;

  canGoTo(destPos: ChessPos, chessboardState: ChessboardState, game: Game) {
    const rowOffset = destPos.row - this.pos.row;
    const colOffset = destPos.col - this.pos.col;

    // 只能走“田”
    return Math.abs(rowOffset) == 2 && Math.abs(colOffset) == 2
      // 同时“田”中心不能有棋子
      && (chessboardState.isEmpty(
        this.pos.row + sign(rowOffset),
        this.pos.col + sign(colOffset),
      ))
      // 不能过河（限制在本方阵地）
      && (this.canCrossBoundary || isInBoundary(game, this.host, destPos));
  }

  clone(): ChessM {
    const clone = new ChessM(this.pos, this.host);
    clone.front = this.front;
    clone.canCrossBoundary = this.canCrossBoundary;
    return clone;
  }
}
