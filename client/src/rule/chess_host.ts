/**
 * 棋方
 */
enum ChessHost {
    /**
     * 先手
     */
    RED = 1,

    /**
     * 后手
     */
    BLACK = 2
}

export default ChessHost;

namespace ChessHost {
  export function reverse(host: ChessHost) {
    return host == ChessHost.BLACK ? ChessHost.RED : ChessHost.BLACK;
  }
}
