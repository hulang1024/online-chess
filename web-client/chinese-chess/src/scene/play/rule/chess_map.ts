import Chess from './Chess';
import ChessC from './chess/ChessC';
import ChessG from './chess/ChessG';
import ChessK from './chess/ChessK';
import ChessM from './chess/ChessM';
import ChessN from './chess/ChessN';
import ChessR from './chess/ChessR';
import ChessS from './chess/ChessS';

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