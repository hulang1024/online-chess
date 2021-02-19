import { socketService } from 'src/boot/main';
import ChessHost from 'src/rulesets/chess_host';
import ChessPos from '../ChessPos';

export default class GobangGameplayServer {
  private socketService = socketService;

  public putChess(pos: ChessPos, chess: ChessHost): void {
    this.socketService.send('play.gobang.chess_put', { pos, chess });
  }
}
