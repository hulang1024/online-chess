import Chess from "./Chess";
import Chessboard from "./chessboard";
import ChessHost from "./chess_host";
import RoundGame from "./RoundGame";

export default class Checkmate {
    private game: RoundGame;
    private redK: Chess;
    private blackK: Chess;

    constructor(game: RoundGame, viewChessHost: ChessHost) {
        this.game = game;

        let chessboard = this.game.getChessboard();
        let redK: Chess;
        let blackK: Chess;
        if (viewChessHost == ChessHost.RED) {
            redK = chessboard.chessAt(9, 4);
            blackK = chessboard.chessAt(0, 4);
        } else {
            redK = chessboard.chessAt(0, 4);
            blackK = chessboard.chessAt(9, 4);
        }
        this.redK = redK;
        this.blackK = blackK;
    }

    /**
     * 检查指定棋方此刻是否被将军
     * @param chessHost 
     */
    check(checkHost: ChessHost): boolean {
        let checkKPos = (checkHost == ChessHost.RED ? this.redK : this.blackK).getPos();
        for (let chess of this.game.getChessboard().getChessList()
            .filter(chess => chess.getHost() != checkHost)) {
            if (chess.canGoTo(checkKPos, this.game)) {
                return true;
            }
        }

        return false;
    }
}