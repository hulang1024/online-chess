import Chess from "./Chess";
import ChessK from "./chess/ChessK";
import Chessboard from "./chessboard";
import ChessPos from "./ChessPos";
import RoundGame from "./RoundGame";

/**
 * 判定胜负
 * @param fromPos 最新移动起始位置
 * @param toPos 最近移动目标位置
 * @param game 
 */
export function judgeVictory(fromPos: ChessPos, toPos: ChessPos | Chess, game: RoundGame) {
    let chess: Chess;
    if (toPos instanceof ChessPos) {
        chess = game.getChessboard().chessAt(toPos);
    } else {
        chess = toPos;
    }
    return chess != null && chess.is(ChessK);
}