import ChessPos from "./ChessPos";
import Game from "./Game";
import AbstractChess from "./AbstractChess";
import { isInKingHome } from "./move_rules";
import ChessboardState from "./ChessboardState";

/**
 * 士
 */
export default class ChessG extends AbstractChess {
  /** 是否可走出九宫 */
  public canGoOutside = false;

  canGoTo(destPos: ChessPos, chessboardState: ChessboardState, game: Game): boolean {
    // 只许沿九宫斜线走单步，可进可退
    return Math.abs(destPos.row - this.pos.row) == 1
      && Math.abs(destPos.col - this.pos.col) == 1
      && (this.canGoOutside || isInKingHome(this, destPos, game));
  }

  clone(): ChessG {
    const clone = new ChessG(this.pos, this.host);
    clone.front = this.front;
    clone.canGoOutside = this.canGoOutside;
    return clone;
  }
}
