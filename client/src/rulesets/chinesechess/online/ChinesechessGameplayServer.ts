import { socketService } from 'src/boot/main';
import ChessPos from '../rule/ChessPos';

export default class ChineseChessGameplayServer {
  private socketService = socketService;

  public pickChess(pos: ChessPos, pickup: boolean): void {
    setTimeout(() => {
      this.socketService.send('play.chinese_chess.chess_pick', { pos, pickup });
    }, 0);
  }

  public moveChess(fromPos: ChessPos, toPos: ChessPos): void {
    setTimeout(() => {
      this.socketService.send('play.chinese_chess.chess_move', { fromPos, toPos });
    }, 0);
  }
}
