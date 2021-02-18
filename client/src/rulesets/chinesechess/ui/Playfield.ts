import { onBeforeUnmount, onMounted } from "@vue/composition-api";
import Signal from "src/utils/signals/Signal";
import TweenAnimationUpdater from "src/rulesets/ui/TweenAnimationUpdater";
import ChessTargetDrawer from "./ChessTargetDrawer";
import DrawableChessboard from "./DrawableChessboard";

export default class Playfield {
  public loaded: Signal = new Signal();

  public chessboard: DrawableChessboard;

  private fromPosTargetDrawer: ChessTargetDrawer;

  private context: Vue;

  public get el(): HTMLDivElement {
    return ((this.context.$refs.playerView as Vue).$refs.playfield as Vue).$el as HTMLDivElement;
  }

  constructor(context: Vue) {
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
      const chessboard = new DrawableChessboard(recalcChessboardSize(), context.$q.screen);
      // eslint-disable-next-line
      this.el.insertBefore(chessboard.el, this.el.firstChild);
      this.chessboard = chessboard;
      this.loaded.dispatch();

      window.addEventListener('resize', onReisze = () => {
        if (isXSScreen) {
          return;
        }
        this.resize(recalcChessboardSize(), context.$q.screen);
      });
    });

    TweenAnimationUpdater.start();

    onBeforeUnmount(() => {
      TweenAnimationUpdater.stop();

      window.removeEventListener('resize', onReisze);
    });
  }

  public resize(stage: {width: number, height: number}, screen: any) {
    this.chessboard.resizeAndDraw(stage, screen);
    if (this.fromPosTargetDrawer?.getSavePos()) {
      this.fromPosTargetDrawer.draw(this.fromPosTargetDrawer.getSavePos());
    }
  }
}
