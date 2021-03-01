import { socketService } from 'src/boot/main';
import ChessPos from '../rule/ChessPos';

export default class ChineseChessGameplayServer {
  private socketService = socketService;

  public pickChess(pos: ChessPos, pickup: boolean): void {
    this.socketService.send('play.chinese_chess.chess_pick', { pos, pickup });
  }

  public moveChess(fromPos: ChessPos, toPos: ChessPos): void {
    this.socketService.send('play.chinese_chess.chess_move', { fromPos, toPos });
  }
}
