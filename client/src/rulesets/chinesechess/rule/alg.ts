import ChessHost from "src/rulesets/chess_host";
import Chess from "./Chess";
import ChessboardState from "./ChessboardState";
import ChessPos from "./ChessPos";
import Game from "./Game";

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

export function isProtectee(target: Chess, game: Game, chessboardState: ChessboardState) {
  const chesses = chessboardState.getChesses();
  for (let i = 0; i < chesses.length; i++) {
    const chess = chesses[i];
    if (chess.getHost() == target.getHost()
      && !chess.getPos().equals(target.getPos())
      && game.canGoTo(chess, target.getPos(), chessboardState)) {
      return true;
    }
  }
  return false;
}

export function isProtecteePos(
  testPos: ChessPos, targetHost: ChessHost, originChess: Chess,
  game: Game, chessboardState: ChessboardState,
) {
  const chesses = chessboardState.getChesses();
  for (let i = 0; i < chesses.length; i++) {
    const chess = chesses[i];
    if (chess.getHost() == targetHost
      && !chess.getPos().equals(originChess.getPos())
      && game.canGoTo(chess, testPos, chessboardState)) {
      return true;
    }
  }
  return false;
}
