import TWEEN from "tween.ts";
import DrawableChess from "./DrawableChess";
import GameAudio from "../../GameAudio";
import ChessPos from "../rule/ChessPos";

function calcSteps(from: ChessPos, to: ChessPos) {
  return Math.max(Math.abs(to.col - from.col), Math.abs(to.row - from.row));
}

export default class ChessMoveAnimation {
  public static make(
    chess: DrawableChess,
    toPos: ChessPos,
    to: { x: number, y: number },
    events: {
      moveEnd?: (() => void) | null,
      dropStart?: (() => void) | null,
      dropEnd: () => void,
    },
    instant = false,
    enableAudio = true,
  ) {
    // 移动一个格子的动画时长
    const stepDuration = 50;
    const steps = calcSteps(chess.getPos(), toPos);
    // 总移动动画时长
    const duration = instant ? 0 : Math.max(200, stepDuration * steps);
    // 翻转动画时长
    const flipDuration = 150;
    // todo: 模块化揭棋代码
    // 是否需要翻转棋子
    const flip = !chess.isFront();
    if (flip) {
      chess.drawFront();
    }

    const emited = {
      dropStart: false,
      dropEnd: false,
      moveEnd: false,
    };

    const onComplete = () => {
      if (flip) {
        chess.flipToFront();
      }
      setTimeout(() => {
        if (events.dropStart && !emited.dropStart) {
          events.dropStart();
          emited.dropStart = true;
          chess.el.classList.remove('overlay');
          if (enableAudio) {
            GameAudio.play('gameplay/chess_move');
          }
        }
        setTimeout(() => {
          if (!emited.dropEnd) {
            events.dropEnd();
            emited.dropEnd = true;
          }
        }, 50);
      }, flip ? flipDuration : 0);
      if (events.moveEnd && !emited.moveEnd) {
        events.moveEnd();
        emited.moveEnd = true;
      }
    };
    // 额外的setTimeout代码，是解决浏览器后台会暂停动画，导致回调不能及时执行，累积状态错误
    setTimeout(() => {
      onComplete();
    }, duration);

    chess.el.classList.add('overlay');
    return new TWEEN.Tween(chess)
      .to(to, duration)
      .easing(TWEEN.Easing.Cubic.Out)
      .onComplete(onComplete);
  }
}
