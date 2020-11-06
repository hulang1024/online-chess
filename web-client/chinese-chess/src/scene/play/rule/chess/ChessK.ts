import ChessHost from "../chess_host";
import ChessPos from "../ChessPos";
import RoundGame from "../RoundGame";
import AbstractChess from "./AbstractChess";
import { isInKingHome, isStraightLineMove } from "./move_rules";

/**
 * 将
 */
export default class ChessK extends AbstractChess {
    constructor(pos: ChessPos, host: ChessHost) {
        super(pos, host);
    }

    canGoTo(destPos: ChessPos, game: RoundGame) {
        // 可以在九宫内走单步，不限制方向（不包括斜着走）
        return isStraightLineMove(
                destPos.row - this.pos.row,
                destPos.col - this.pos.col,
                1)
            && isInKingHome(this, destPos, game);
    }
}
