import { onBeforeUnmount, onMounted } from "vue";
import Signal from "src/utils/signals/Signal";
import Ruleset from "src/rulesets/Ruleset";
import DrawableChessboard from "src/rulesets/ui/DrawableChessboard";

export default class Playfield {
  public loaded: Signal = new Signal();

  public resized: Signal = new Signal();

  public chessboard: DrawableChessboard;

  public context: Vue;

  public get el(): HTMLDivElement {
    return ((this.context.$refs.playerView as Vue).$refs.playfield as Vue).$el as HTMLDivElement;
  }

  constructor(context: Vue, ruleset: Ruleset) {
    this.context = context;
    // eslint-disable-next-line
    const isMobile = context.$q.platform.is.mobile;

    let onReisze: () => void;
    onMounted(() => {
      const pageEl = context.$el as HTMLElement;
      const recalcPlayfieldSize = () => {
        let width = pageEl?.offsetWidth || 0;
        if (!isMobile) {
          width -= 56 * 2 + 24;
          // eslint-disable-next-line
          width -= ((context.$refs.playerView as Vue).$refs.controls as any).offsetWidth + 8;
        }
        let height = (pageEl?.parentElement?.offsetHeight || 0);
        if (isMobile) {
          const userCardHeight = 62;
          height -= userCardHeight * 2;
        } else {
          height -= 84;
        }
        return {
          width,
          height,
        };
      };

      // eslint-disable-next-line
      this.chessboard = ruleset.createChessboard(recalcPlayfieldSize(), context.$q.screen);

      // eslint-disable-next-line
      this.el.insertBefore(this.chessboard.el, this.el.firstChild);
      this.loaded.dispatch();

      window.addEventListener('resize', onReisze = () => {
        // eslint-disable-next-line
        if (isMobile) {
          // 可能包括是移动端键盘弹出导致的resize
          return;
        }
        setTimeout(() => {
          this.resize(recalcPlayfieldSize(), context.$q.screen);
          this.resized.dispatch();
        }, 0);
      });
    });

    onBeforeUnmount(() => {
      this.chessboard.destroy();
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
