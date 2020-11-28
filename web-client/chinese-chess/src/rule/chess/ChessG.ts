import ChessHost from "../chess_host";
import ChessPos from "../ChessPos";
import Game from "../Game";
import AbstractChess from "./AbstractChess";
import { isInKingHome } from "./move_rules";

/**
 * 士
 */
export default class ChessG extends AbstractChess {
    constructor(pos: ChessPos, host: ChessHost) {
        super(pos, host);
    }

    canGoTo(destPos: ChessPos, game: Game) {
        // 只许沿九宫斜线走单步，可进可退
        return Math.abs(destPos.row - this.pos.row) == 1
            && Math.abs(destPos.col - this.pos.col) == 1
            && isInKingHome(this, destPos, game);
    }
}
