import device from "current-device";
import { onBeforeUnmount, onMounted } from "@vue/composition-api";
import Signal from "src/utils/signals/Signal";
import TweenAnimationUpdater from "src/rulesets/ui/TweenAnimationUpdater";
import Ruleset from "src/rulesets/Ruleset";
import DrawableChessboard from "src/rulesets/ui/DrawableChessboard";

export default class Playfield {
  public loaded: Signal = new Signal();

  public resized: Signal = new Signal();

  public chessboard: DrawableChessboard;

  private context: Vue;

  public get el(): HTMLDivElement {
    return ((this.context.$refs.playerView as Vue).$refs.playfield as Vue).$el as HTMLDivElement;
  }

  constructor(context: Vue, ruleset: Ruleset) {
    this.context = context;
    const isXSScreen = context.$q.screen.xs;

    let onReisze: () => void;
    onMounted(() => {
      const pageEl = context.$el as HTMLElement;
      const recalcChessboardSize = () => {
        let width = pageEl?.offsetWidth || 0;
        if (!isXSScreen) {
          width -= 56 * 2 + 24;
          // eslint-disable-next-line
          width -= ((context.$refs.playerView as Vue).$refs.controls as any).offsetWidth + 8;
        }
        let height = (pageEl?.parentElement?.offsetHeight || 0) - 36;
        if (isXSScreen) {
          const userCardHeight = 68;
          height -= (userCardHeight + 8) * 2;
        } else {
          height -= 64;
        }
        return {
          width,
          height,
        };
      };

      // eslint-disable-next-line
      this.chessboard = ruleset.createChessboard(recalcChessboardSize(), context.$q.screen);

      // eslint-disable-next-line
      this.el.insertBefore(this.chessboard.el, this.el.firstChild);
      this.loaded.dispatch();

      window.addEventListener('resize', onReisze = () => {
        // eslint-disable-next-line
        if (device.mobile()) {
          // 可能包括是移动端键盘弹出导致的resize
          return;
        }
        setTimeout(() => {
          this.resize(recalcChessboardSize(), context.$q.screen);
          this.resized.dispatch();
        }, 0);
      });
    });

    TweenAnimationUpdater.start();

    onBeforeUnmount(() => {
      TweenAnimationUpdater.stop();

      window.removeEventListener('resize', onReisze);
    });
  }

  public hideContent() {
    this.chessboard.hide();
  }

  public showContent() {
    this.chessboard.show();
  }

  public resize(stage: {width: number, height: number}, screen: any) {
    this.chessboard.resizeAndDraw(stage, screen);
  }
}
