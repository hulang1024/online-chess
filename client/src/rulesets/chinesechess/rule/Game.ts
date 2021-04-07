import ChessHost from "../../chess_host";
import Chess from "./Chess";
import ChessboardState from "./ChessboardState";
import ChessPos from "./ChessPos";

export default abstract class Game {
  /**
   * 查看指定方是否布局在棋盘顶部
   * @param host
   * @return
   */
  isHostAtChessboardTop: (host: ChessHost) => boolean;

  canGoTo: (chess: Chess | null, destPos: ChessPos, chessboardState?: ChessboardState) => boolean;
}
