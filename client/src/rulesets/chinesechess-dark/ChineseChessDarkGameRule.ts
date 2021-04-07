import ChessHost from '../chess_host';
import ChineseChessGameRule from '../chinesechess/ChineseChessGameRule';
import Chess from '../chinesechess/rule/Chess';
import ChessboardState from '../chinesechess/rule/ChessboardState';
import ChessG from '../chinesechess/rule/ChessG';
import ChessM from '../chinesechess/rule/ChessM';
import ChessPos from '../chinesechess/rule/ChessPos';
import { queryMoveRuleByOriginPos } from './rules';

export default class ChineseChessDarkGameRule extends ChineseChessGameRule {
  constructor() {
    super();
    this.enableOutsideChessPanel = true;
  }

  public canGoTo(chess: Chess | null, destPos: ChessPos,
    chessboardState?: ChessboardState): boolean {
    let moveRule: Chess;
    if (chess?.isFront()) {
      moveRule = chess;
      if (chess.is(ChessM)) {
        (chess as ChessM).canCrossBoundary = true;
      } else if (chess.is(ChessG)) {
        (chess as ChessG).canGoOutside = true;
      }
    } else {
      const isViewChessHost = this.viewChessHost == chess?.getHost();
      moveRule = queryMoveRuleByOriginPos(isViewChessHost, chess?.getPos() as ChessPos);
      moveRule.setHost(chess?.getHost() as ChessHost);
    }
    return moveRule?.canGoTo(destPos, chessboardState || this.chessboardState, this);
  }
}
