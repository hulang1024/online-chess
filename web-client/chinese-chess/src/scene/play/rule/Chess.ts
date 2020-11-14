import ChessPos from './ChessPos';
import ChessHost from './chess_host';
import RoundGame from './RoundGame';

/**
 * 棋子
 */
export default interface Chess {
    canGoTo: (destPos: ChessPos, game: RoundGame) => boolean;

    getPos: () => ChessPos;

    setPos: (pos: ChessPos) => void;
    
    getHost: () => ChessHost;

    // instanceof有问题，代替
    is: (chessClass: Function) => boolean;
}
