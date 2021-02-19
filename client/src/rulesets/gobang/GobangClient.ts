import { socketService } from 'src/boot/main';
import GameRule from '../GameRule';
import RulesetClient from '../RulesetClient';
import ChessAction from './ChessAction';
import ChessPos from './ChessPos';
import GobangGameRule from './GobangGameRule';
import { ChessPutMsg } from './online/gameplay_server_messages';

export default class GobangClient extends RulesetClient {
  constructor(game: GameRule) {
    super(game);
    socketService.on('play.gobang.chess_put', this.chessPut, this);
  }

  public exit() {
    socketService.off('play.gobang.chess_put', this.chessPut, this);
  }

  private chessPut(msg: ChessPutMsg) {
    const action = new ChessAction();
    action.pos = ChessPos.make(msg.pos);
    action.chess = msg.chess;
    (this.game as GobangGameRule).onChessAction(action);
  }
}
