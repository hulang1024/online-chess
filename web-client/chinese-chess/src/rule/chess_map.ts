import Chess from './Chess';
import ChessC from './chess/ChessC';
import ChessG from './chess/ChessG';
import ChessK from './chess/ChessK';
import ChessM from './chess/ChessM';
import ChessN from './chess/ChessN';
import ChessR from './chess/ChessR';
import ChessS from './chess/ChessS';
import ChessPos from './ChessPos';
import ChessHost from './chess_host';

const CHESS_CLASS_KEY_MAP = {
    R: ChessR,
    N: ChessN,
    M: ChessM,
    G: ChessG,
    K: ChessK,
    C: ChessC,
    S: ChessS
};

export default CHESS_CLASS_KEY_MAP;

export function classClassToKey(chess: Chess) {
    if (chess instanceof ChessC) return 'C';
    if (chess instanceof ChessG) return 'G';
    if (chess instanceof ChessK) return 'K';
    if (chess instanceof ChessM) return 'M';
    if (chess instanceof ChessN) return 'N';
    if (chess instanceof ChessR) return 'R';
    if (chess instanceof ChessS) return 'S';
}

export function createIntialLayoutChessList(chessHost1: ChessHost, chessHost2: ChessHost) {
    return [
        new ChessR(new ChessPos(0, 0), chessHost1),
        new ChessN(new ChessPos(0, 1), chessHost1),
        new ChessM(new ChessPos(0, 2), chessHost1),
        new ChessG(new ChessPos(0, 3), chessHost1),
        new ChessK(new ChessPos(0, 4), chessHost1),
        new ChessG(new ChessPos(0, 5), chessHost1),
        new ChessM(new ChessPos(0, 6), chessHost1),
        new ChessN(new ChessPos(0, 7), chessHost1),
        new ChessR(new ChessPos(0, 8), chessHost1),
        new ChessC(new ChessPos(2, 1), chessHost1),
        new ChessC(new ChessPos(2, 7), chessHost1),
        new ChessS(new ChessPos(3, 0), chessHost1),
        new ChessS(new ChessPos(3, 2), chessHost1),
        new ChessS(new ChessPos(3, 4), chessHost1),
        new ChessS(new ChessPos(3, 6), chessHost1),
        new ChessS(new ChessPos(3, 8), chessHost1),

        new ChessR(new ChessPos(9, 0), chessHost2),
        new ChessN(new ChessPos(9, 1), chessHost2),
        new ChessM(new ChessPos(9, 2), chessHost2),
        new ChessG(new ChessPos(9, 3), chessHost2),
        new ChessK(new ChessPos(9, 4), chessHost2),
        new ChessG(new ChessPos(9, 5), chessHost2),
        new ChessM(new ChessPos(9, 6), chessHost2),
        new ChessN(new ChessPos(9, 7), chessHost2),
        new ChessR(new ChessPos(9, 8), chessHost2),
        new ChessC(new ChessPos(7, 1), chessHost2),
        new ChessC(new ChessPos(7, 7), chessHost2),
        new ChessS(new ChessPos(6, 0), chessHost2),
        new ChessS(new ChessPos(6, 2), chessHost2),
        new ChessS(new ChessPos(6, 4), chessHost2),
        new ChessS(new ChessPos(6, 6), chessHost2),
        new ChessS(new ChessPos(6, 8), chessHost2),
    ];
}