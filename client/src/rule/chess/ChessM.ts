import ChessPos from "../ChessPos";
import Game from "../Game";
import AbstractChess from "./AbstractChess";
import { isInBoundary, sign } from "./move_rules";

/**
 * 象
 */
export default class ChessM extends AbstractChess {
  canGoTo(destPos: ChessPos, game: Game) {
    const rowOffset = destPos.row - this.pos.row;
    const colOffset = destPos.col - this.pos.col;

    // 不能过河（限制在本方阵地）
    return isInBoundary(game, this.host, destPos)
      // 只能走“田”
      && Math.abs(rowOffset) == 2 && Math.abs(colOffset) == 2
      // 同时“田”中心不能有棋子
      && (game.getChessboard().isEmpty(
        this.pos.row + sign(rowOffset),
        this.pos.col + sign(colOffset),
      ));
  }
}
