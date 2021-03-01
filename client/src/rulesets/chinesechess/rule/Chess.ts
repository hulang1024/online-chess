import ChessPos from './ChessPos';
import ChessHost from '../../chess_host';
import Game from './Game';

/**
 * 棋子
 */
export default interface Chess {
  canGoTo(destPos: ChessPos, game: Game): boolean;

  getPos(): ChessPos;

  setPos(pos: ChessPos): void;

  getHost(): ChessHost;

  setFront(b: boolean): void;

  isFront(): boolean;

  // instanceof有问题，代替
  is(chessClass: any): boolean
}
