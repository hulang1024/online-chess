import Chessboard from "./Chessboard";
import ChessHost from "./chess_host";

export default abstract class Game {
  getChessboard: () => Chessboard;

  /**
   * 查看指定方是否布局在棋盘顶部
   * @param host
   * @return
   */
  isHostAtChessboardTop: (host: ChessHost) => boolean;
}
