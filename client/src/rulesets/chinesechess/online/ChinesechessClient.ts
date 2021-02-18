import { socketService } from 'src/boot/main';
import { ChessMoveMsg, ChessPickUpMsg } from './gameplay_server_messages';

export default abstract class ChinesechessClient {
  constructor() {
    socketService.on('play.chess_pick', this.chessPickup, this);
    socketService.on('play.chess_move', this.chessMove, this);
  }

  public exit() {
    socketService.off('play.chess_pick', this.chessPickup, this);
    socketService.off('play.chess_move', this.chessMove, this);
  }

  protected abstract chessPickup(msg: ChessPickUpMsg): void;

  protected abstract chessMove(msg: ChessMoveMsg): void;
}
