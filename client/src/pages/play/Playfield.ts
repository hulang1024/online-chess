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
        const width = pageEl?.offsetWidth || 0;
        const height = (pageEl?.parentElement?.offsetHeight || 0) - 40 - 16 || 0;
        return {
          width: isXSScreen
            ? width
            // eslint-disable-next-line
            : width - ((context.$refs.playerView as Vue).$refs.controls as any).offsetWidth + 8,
          height,
        };
      };

      // eslint-disable-next-line
      this.chessboard = ruleset.createChessboard(recalcChessboardSize(), context.$q.screen);

      // eslint-disable-next-line
      this.el.insertBefore(this.chessboard.el, this.el.firstChild);
      this.loaded.dispatch();

      window.addEventListener('resize', onReisze = () => {
        if (isXSScreen) {
          return;
        }
        this.resize(recalcChessboardSize(), context.$q.screen);
        this.resized.dispatch();
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
