import Chess from 'src/rulesets/chinesechess/rule/Chess';
import ChessPos from 'src/rulesets/chinesechess/rule/ChessPos';
import ChessHost from 'src/rulesets/chess_host';
import { chessClassToText } from 'src/rulesets/chinesechess/rule/chess_map';
import Game from 'src/rulesets/chinesechess/rule/Game';
import Signal from 'src/utils/signals/Signal';
import './chess.scss';

export default class DrawableChess implements Chess {
  private _el: HTMLDivElement;

  public get el() { return this._el; }

  private _selectable = false;

  private _selected = false;

  private _lit = false;

  public get lit() { return this._lit; }

  public readonly drop = new Signal();

  public readonly pickup = new Signal();

  /**
   * 点击事件，与可选中不同
   */
  public readonly clicked = new Signal();

  public readonly chess: Chess;

  private radius: number;

  constructor(chess: Chess, radius: number) {
    this.chess = chess;
    this.radius = radius;
    this.load();
  }

  private load() {
    const el = document.createElement('div');
    this._el = el;
    const colorClass = this.chess.getHost() == ChessHost.FIRST ? 'red' : 'black';
    el.classList.add('chess', colorClass);
    el.style.lineHeight = `${this.radius * 2}px`;

    const circle = document.createElement('div');
    circle.className = 'chess__circle';

    el.appendChild(circle);

    this.setFront(this.chess.isFront());

    this.setupDragable();

    el.onclick = (event) => {
      event.stopPropagation();
      this.clicked.dispatch(this);
    };

    this.resizeAndDraw(this.radius);
  }

  private setupDragable() {
    const el = this._el;
    el.ondragstart = (event: DragEvent) => {
      if (!this.selectable) {
        return;
      }
      this.selected = true;
      this.pickup.dispatch();
      const { row, col } = this.getPos();
      // 此处传递是哪个棋子被拖拽，但是传递值只能是字符串因此传递位置
      // eslint-disable-next-line
      event.dataTransfer?.setData('chess-pos', `${row},${col}`);
    };
    el.ondragend = () => {
      el.style.outline = '';
      this.selected = false;
      this.drop.dispatch();
    };
  }

  public resizeAndDraw(radius: number) {
    const el = this._el;
    el.style.width = `${radius * 2}px`;
    el.style.height = `${radius * 2}px`;
    el.style.fontSize = `${radius + 4}px`;
    this.radius = radius;
  }

  public flip() {
    this.setFront(!this.chess.isFront());
  }

  public set x(val: number) {
    this._el.style.left = `${val - this.radius}px`;
  }

  public get x() { return this._el.offsetLeft + this.radius; }

  public set y(val: number) {
    this._el.style.top = `${val - this.radius}px`;
  }

  public get y() { return this._el.offsetTop + this.radius; }

  public set selectable(val: boolean) {
    this._selectable = val;
    this._el.draggable = val;
    this._el.classList[val ? 'add' : 'remove']('selectable');
  }

  public get selectable() { return this._selectable; }

  public set selected(value: boolean) {
    if (!this.selectable) {
      return;
    }
    if (this._selected == value) return;
    this._selected = value;
    this._el.classList[value ? 'add' : 'remove']('selected');
  }

  public get selected() { return this._selected; }

  public setLit(lit: boolean) {
    if (this._lit == lit) return;
    this._lit = lit;
    this._el.classList[lit ? 'add' : 'remove']('lit');
  }

  public canGoTo(destPos: ChessPos, game: Game) {
    return this.chess.canGoTo(destPos, game);
  }

  public setPos(pos: ChessPos) {
    this.chess.setPos(pos);
  }

  public getPos() {
    return this.chess.getPos();
  }

  public getHost() {
    return this.chess.getHost();
  }

  public setFront(b: boolean) {
    this.chess.setFront(b);
    const circle = this.el.firstChild as HTMLDivElement;
    circle.innerText = this.chess.isFront() ? chessClassToText(this.chess) : '';
  }

  public isFront() {
    return this.chess.isFront();
  }

  public is(chessClass: unknown) {
    return this.chess.is(chessClass);
  }
}
