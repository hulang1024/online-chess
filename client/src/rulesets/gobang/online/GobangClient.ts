import { socketService } from 'src/boot/main';
import GameRule from '../../GameRule';
import RulesetClient from '../../online/RulesetClient';
import ChessAction from '../ChessAction';
import ChessPos from '../ChessPos';
import GobangGameRule from '../GobangGameRule';
import GobangUserPlayInput from '../GobangUserPlayInput';
import { ChessPutMsg, ChessTargetPosMsg } from './gameplay_server_messages';

export default class GobangClient extends RulesetClient {
  constructor(game: GameRule) {
    super(game);
    socketService.on('play.gobang.chess_put', this.chessPut, this);
    socketService.on('play.gobang.chess_target_pos', this.chessTargetPos, this);
  }

  public exit() {
    socketService.off('play.gobang.chess_put', this.chessPut, this);
    socketService.off('play.gobang.chess_target_pos', this.chessTargetPos, this);
  }

  private chessPut(msg: ChessPutMsg) {
    const { mouseChessTarget } = (this.userPlayInput as GobangUserPlayInput);
    mouseChessTarget.hide();
    const action = new ChessAction();
    action.pos = ChessPos.make(msg.pos);
    action.chess = msg.chess;
    (this.game as GobangGameRule).onChessAction(action);
  }

  private chessTargetPos(msg: ChessTargetPosMsg) {
    const { mouseChessTarget } = (this.userPlayInput as GobangUserPlayInput);
    if (msg.pos) {
      mouseChessTarget.setChess(msg.chess);
      mouseChessTarget.show(ChessPos.make(msg.pos));
    } else {
      mouseChessTarget.hide();
    }
  }
}
