/**
 * 棋方
 */
enum ChessHost {
    /**
     * 先手
     */
    FIRST = 1,

    /**
     * 后手
     */
    SECOND = 2
}

export default ChessHost;

// eslint-disable-next-line
namespace ChessHost {
  // eslint-disable-next-line
  export function reverse(host: ChessHost) {
    return host == ChessHost.SECOND ? ChessHost.FIRST : ChessHost.SECOND;
  }
}
