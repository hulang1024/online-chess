import Chess from '../chinesechess/rule/Chess';
import ChessC from '../chinesechess/rule/ChessC';
import ChessG from '../chinesechess/rule/ChessG';
import ChessM from '../chinesechess/rule/ChessM';
import ChessN from '../chinesechess/rule/ChessN';
import ChessPos from '../chinesechess/rule/ChessPos';
import ChessR from '../chinesechess/rule/ChessR';
import ChessS from '../chinesechess/rule/ChessS';

const originPosArray = [
  [
    [0, 0], [0, 1], [0, 2], [0, 3],
    [0, 5], [0, 6], [0, 7], [0, 8],
    [2, 1], [2, 7],
    [3, 0], [3, 2], [3, 4], [3, 6], [3, 8],
  ],
  [
    [9, 0], [9, 1], [9, 2], [9, 3],
    [9, 5], [9, 6], [9, 7], [9, 8],
    [7, 1], [7, 7],
    [6, 0], [6, 2], [6, 4], [6, 6], [6, 8],
  ],
];

const chessClassArray = [
  ChessR, ChessN, ChessM, ChessG,
  ChessG, ChessM, ChessN, ChessR,
  ChessC, ChessC,
  ChessS, ChessS, ChessS, ChessS, ChessS,
];

export function queryMoveRuleByOriginPos(isViewChessHost: boolean, originPos: ChessPos) {
  const index = originPosArray[isViewChessHost ? 1 : 0]
    .findIndex(([row, col]) => originPos.row == row && originPos.col == col);
  // eslint-disable-next-line
  const chess: Chess = new (chessClassArray[index] as any)(originPos, null);
  return chess;
}
