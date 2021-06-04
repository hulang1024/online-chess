import ChineseChessGameRule from '../chinesechess/ChineseChessGameRule';
import Chess from '../chinesechess/rule/Chess';
import ChessboardState from '../chinesechess/rule/ChessboardState';
import ChessG from '../chinesechess/rule/ChessG';
import ChessK from '../chinesechess/rule/ChessK';
import ChessM from '../chinesechess/rule/ChessM';
import ChessPos from '../chinesechess/rule/ChessPos';
import ChineseChessDarkGameSettings from './ChineseChessDarkGameSettings';
import { queryMoveRuleByOriginPos } from './rules';

export default class ChineseChessDarkGameRule extends ChineseChessGameRule {
  private gameSettings: ChineseChessDarkGameSettings;

  constructor(gameSettings: ChineseChessDarkGameSettings) {
    super();
    this.gameSettings = gameSettings;
    this.enableOutsideChessPanel = true;
  }

  public canGoTo(chess: Chess | null, destPos: ChessPos,
    chessboardState?: ChessboardState): boolean {
    if (chess == null) {
      return false;
    }
    let moveRule: Chess;
    if (chess.isFront()) {
      moveRule = chess;
    } else {
      moveRule = queryMoveRuleByOriginPos(chess.getPos());
      moveRule.setHost(chess.getHost());
    }
    if (moveRule.is(ChessM)) {
      (moveRule as ChessM).canCrossBoundary = true;
    } else if (moveRule.is(ChessG)) {
      if (chess.isFront()) {
        (moveRule as ChessG).canGoOutside = true;
      }
    } else if (this.gameSettings.fullRandom && moveRule.is(ChessK)) {
      (moveRule as ChessK).canGoOutside = true;
    }
    return moveRule?.canGoTo(destPos, chessboardState || this.chessboardState, this);
  }
}
