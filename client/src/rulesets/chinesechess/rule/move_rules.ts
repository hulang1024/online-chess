import Chess from "./Chess";
import ChessHost from "../../chess_host";
import ChessPos from "./ChessPos";
import Game from "./Game";
import ChessboardState from "./ChessboardState";

export const MAX_DISTANCE = 10;

/**
 * 判定是直线移动
 * @param rowOffset
 * @param colOffset
 * @param maxDistance
 * @return
 */
export function isStraightLineMove(rowOffset: number, colOffset: number, maxDistance: number) {
  rowOffset = Math.abs(rowOffset);
  colOffset = Math.abs(colOffset);
  return (rowOffset <= maxDistance && colOffset == 0)
  || (rowOffset == 0 && colOffset <= maxDistance);
}

/**
 * 目标位置是否在本方阵地内
 * @param game
 * @param host 棋子方
 * @param destPos 目标位置
 * @return
 */
export function isInBoundary(game: Game, host: ChessHost, destPos: ChessPos) {
  return game.isHostAtChessboardTop(host) ? destPos.row < 5 : destPos.row > 4;
}

/**
 * 判定目标位置是否在九宫格内
 * @param chess
 * @param destPos
 * @return
 */
export function isInKingHome(chess: Chess, destPos: ChessPos, game: Game) {
  return (destPos.col >= 3 && destPos.col <= 5)
    && (game.isHostAtChessboardTop(chess.getHost())
      ? (destPos.row >= 0 && destPos.row <= 2)
      : (destPos.row >= 7 && destPos.row <= 9));
}

/**
 * 查询棋子的所有可走位置
 * @param chess 指定棋子
 * @return 位置数组
 */
export function findChessGoPoss(
  chess: Chess, game: Game, chessboardState: ChessboardState,
): ChessPos[] {
  const found = [];
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const dest = new ChessPos(row, col);
      if (!dest.equals(chess.getPos())
        && game.canGoTo(chess, dest)
        && (chessboardState.isEmpty(row, col)
          || chessboardState.chessAt(dest)?.getHost() != chess.getHost())) {
        found.push(dest);
      }
    }
  }
  return found;
}

export function sign(n: number) {
  return n == 0 ? 0 : (n > 0 ? +1 : -1);
}
