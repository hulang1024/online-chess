import Signal from "src/utils/signals/Signal";
import './chessboard.scss';

export default abstract class DrawableChessboard {
  protected _el: HTMLDivElement;

  public get el() { return this._el; }

  public readonly clicked = new Signal();

  public show() {
    this.el.classList.remove('elements-hide');
  }

  public hide() {
    this.el.classList.add('elements-hide');
  }

  public abstract clear(): void;

  public abstract resizeAndDraw(stage: {width: number, height: number}, screen: any): void;

  public abstract destroy(): void;
}
