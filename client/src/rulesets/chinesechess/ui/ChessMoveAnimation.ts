import TWEEN from "tween.ts";
import DrawableChess from "./DrawableChess";
import GameAudio from "../../GameAudio";

export default class ChessMoveAnimation {
  public static make(
    chess: DrawableChess,
    to: { x: number, y: number },
    onComplete: () => void,
    duration = 200,
    enableAudio = true,
  ) {
    // 使用setTimeout而不是动画onComplete，因为浏览器后台会暂停动画
    setTimeout(() => {
      if (enableAudio) {
        GameAudio.play('gameplay/chess_move');
      }
    }, duration);
    return new TWEEN.Tween(chess)
      .to(to, duration)
      .easing(TWEEN.Easing.Circular.Out)
      .onComplete(() => {
        // 高亮被移动棋子
        chess.setLit(true);

        onComplete();
      });
  }
}
