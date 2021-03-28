import Chess from './Chess';
import ChessC from './ChessC';
import ChessG from './ChessG';
import ChessK from './ChessK';
import ChessM from './ChessM';
import ChessN from './ChessN';
import ChessR from './ChessR';
import ChessS from './ChessS';
import ChessPos from './ChessPos';
import ChessHost from '../../chess_host';

const CHESS_CLASS_KEY_MAP: {[type: string]: any} = {
  R: ChessR,
  N: ChessN,
  M: ChessM,
  G: ChessG,
  K: ChessK,
  C: ChessC,
  S: ChessS,
};

export default CHESS_CLASS_KEY_MAP;

export function chessClassToKey(chess: Chess) {
  if (chess instanceof ChessC) return 'C';
  if (chess instanceof ChessG) return 'G';
  if (chess instanceof ChessK) return 'K';
  if (chess instanceof ChessM) return 'M';
  if (chess instanceof ChessN) return 'N';
  if (chess instanceof ChessR) return 'R';
  if (chess instanceof ChessS) return 'S';
  return null;
}

export function chessClassToText(chess: Chess) {
  let text: string[] = [];
  // 繁体字在某些设备中可能会没有字体
  if (chess instanceof ChessC) text = ['炮', '炮'];
  if (chess instanceof ChessG) text = ['士', '士'];
  if (chess instanceof ChessK) text = ['帅', '将'];
  if (chess instanceof ChessM) text = ['相', '象'];
  if (chess instanceof ChessN) text = ['马', '馬'];
  if (chess instanceof ChessR) text = ['车', '車'];
  if (chess instanceof ChessS) text = ['兵', '卒'];
  return text[chess.getHost() - 1];
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
