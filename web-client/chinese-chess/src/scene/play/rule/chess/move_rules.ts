import Chess from "../Chess";
import ChessHost from "../chess_host";
import ChessPos from "../ChessPos";
import RoundGame from "../RoundGame";

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
export function isInBoundary(game: RoundGame, host: ChessHost, destPos: ChessPos) {
    return game.isHostAtChessboardTop(host) ? destPos.row < 5 : destPos.row > 4;
}

/**
 * 判定目标位置是否在九宫格内
 * @param chess
 * @param destPos
 * @return
 */
export function isInKingHome(chess: Chess, destPos: ChessPos, game: RoundGame) {
    return (3 <= destPos.col && destPos.col <= 5)
    && (game.isHostAtChessboardTop(chess.getHost())
        ? (0 <= destPos.row && destPos.row <= 2)
        : (7 <= destPos.row && destPos.row <= 9));
}

export function sign(n: number) { return n == 0 ? 0 : (n > 0 ? +1 : -1); }