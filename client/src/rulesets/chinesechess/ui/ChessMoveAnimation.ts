import TWEEN from "tween.ts";
import DrawableChess from "./DrawableChess";
import GameAudio from "../../GameAudio";

export default class ChessMoveAnimation {
  public static make(
    chess: DrawableChess,
    to: { x: number, y: number },
    events: {
      moveEnd?: (() => void) | null,
      dropStart?: (() => void) | null,
      dropEnd: () => void,
    },
    duration = 180,
    enableAudio = true,
  ) {
    const flipDuration = 150;
    // todo: 模块化揭棋代码
    // 是否需要翻转棋子
    const flip = !chess.isFront();
    if (flip) {
      chess.drawFront();
    }
    // 使用setTimeout而不是动画onComplete，因为浏览器后台会暂停动画
    let audioPlayed = false;
    setTimeout(() => {
      if (enableAudio && !audioPlayed) {
        GameAudio.play('gameplay/chess_move');
        audioPlayed = true;
      }
    }, duration + (flip ? flipDuration : 0) + 100);
    chess.el.classList.add('overlay');
    return new TWEEN.Tween(chess)
      .to(to, duration)
      .easing(TWEEN.Easing.Circular.Out)
      .onComplete(() => {
        if (flip) {
          chess.flipToFront();
        }
        setTimeout(() => {
          if (events.dropStart) {
            events.dropStart();
          }
          chess.el.classList.remove('overlay');
          if (enableAudio && !audioPlayed) {
            GameAudio.play('gameplay/chess_move');
            audioPlayed = true;
          }
          setTimeout(() => {
            events.dropEnd();
          }, 50);
        }, flip ? flipDuration : 0);
        if (events.moveEnd) {
          events.moveEnd();
        }
      });
  }
}
