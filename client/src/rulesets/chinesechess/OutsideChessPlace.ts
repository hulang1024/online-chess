import DrawableChess from "./ui/DrawableChess";

export default class OutsideChessPlace {
  public readonly el = document.createElement('div');

  public drawableChess: DrawableChess;

  public counterEl = document.createElement('div');

  private _count = 0;

  public get count() {
    return this._count;
  }

  constructor(drawableChess: DrawableChess) {
    this.el.classList.add('chess-place');
    this.counterEl.classList.add('counter');
    this.el.appendChild(drawableChess.el);
    this.el.appendChild(this.counterEl);
    this.incCount(1);
    this.drawableChess = drawableChess;
  }

  public incCount(inc: number) {
    this._count += inc;
    this.counterEl.innerText = this.count.toString();
    this.counterEl.classList[this.count > 1 ? 'add' : 'remove']('show');
    this.counterEl.classList.add('change');
    this.counterEl.onanimationend = () => {
      this.counterEl.classList.remove('change');
    };
  }
}
