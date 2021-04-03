import ChessPos from './ChessPos';
import ChessHost from '../../chess_host';
import Game from './Game';
import ChessboardState from './ChessboardState';

/**
 * 棋子
 */
export default interface Chess {
  canGoTo(destPos: ChessPos, chessboardState: ChessboardState, game: Game): boolean;

  getPos(): ChessPos;

  setPos(pos: ChessPos): void;

  setHost(host: ChessHost): void;

  getHost(): ChessHost;

  setFront(b: boolean): void;

  isFront(): boolean;

  clone(): Chess;

  // instanceof有问题，代替
  is(chessClass: any): boolean
}
