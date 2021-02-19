import Chess from "../Chess";
import ChessPos from "../ChessPos";
import ChessHost from "../../chess_host";
import Game from "../Game";

/**
 * 抽象的棋子
 */
export default abstract class AbstractChess implements Chess {
  /** 当前位置 */
  protected pos: ChessPos;

  /** 所属棋方 */
  protected host: ChessHost;

  /** 是否是正面 */
  protected front = true;

  constructor(pos: ChessPos, host: ChessHost) {
    this.pos = pos;
    this.host = host;
  }

  abstract canGoTo(destPos: ChessPos, game: Game): boolean;

  setPos(pos: ChessPos) {
    this.pos = pos;
  }

  getPos() {
    return this.pos;
  }

  getHost() {
    return this.host;
  }

  setFront(b: boolean) {
    this.front = b;
  }

  isFront() {
    return this.front;
  }

  is(chessClass: any) {
    return this instanceof chessClass;
  }
}
