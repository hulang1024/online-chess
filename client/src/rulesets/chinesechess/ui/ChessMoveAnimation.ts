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
    const flipDuration = 200;
    const dropDuration = 50;
    // 使用setTimeout而不是动画onComplete，因为浏览器后台会暂停动画
    setTimeout(() => {
      // todo: 模块化揭棋代码
      // 是否需要翻转棋子
      const flip = !chess.isFront();
      if (flip) {
        chess.setFront(true);
      }
      setTimeout(() => {
        chess.el.classList.remove('overlay');
        chess.setLit(true);

        setTimeout(() => {
          if (enableAudio) {
            GameAudio.play('gameplay/chess_move');
          }
        }, dropDuration);
        onComplete();
      }, flip ? flipDuration : 0);
    }, duration);
    chess.el.classList.add('overlay');
    return new TWEEN.Tween(chess)
      .to(to, duration)
      .easing(TWEEN.Easing.Circular.Out);
  }
}
