import Chess from 'src/rulesets/chinesechess/Chess';
import ChessPos from 'src/rulesets/chinesechess/ChessPos';
import ChessHost from 'src/rulesets/chinesechess/chess_host';
import { chessClassToText } from 'src/rulesets/chinesechess/chess_map';
import Game from 'src/rulesets/chinesechess/Game';
import Signal from 'src/utils/signals/Signal';
import { CHESS_BLACK, CHESS_RED } from "./colors";

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
    const color = this.chess.getHost() == ChessHost.RED ? CHESS_RED : CHESS_BLACK;
    el.className = 'chess shadow-2';
    el.style.position = 'absolute';
    el.style.display = 'flex';
    el.style.justifyContent = 'center';
    el.style.alignItems = 'center';
    el.style.backgroundColor = '#f5e1c1';
    el.style.userSelect = 'none';
    el.style.color = color;
    el.style.outlineOffset = '1px';
    el.style.fontWeight = 'bolder';
    el.style.textAlign = 'center';
    el.style.lineHeight = `${this.radius * 2}px`;

    const circle = document.createElement('div');
    circle.className = 'chess__circle';
    circle.style.display = 'flex';
    circle.style.justifyContent = 'center';
    circle.style.alignItems = 'center';
    circle.style.width = 'calc(100% - 4px)';
    circle.style.height = 'calc(100% - 4px)';
    circle.style.border = `1px solid ${color}`;
    circle.style.pointerEvents = 'none';
    circle.style.borderRadius = '100%';

    el.appendChild(circle);

    this.setFront(this.chess.isFront());
    el.onmouseenter = () => {
      if (!this.selectable || this.lit || this.selected) return;
      el.style.outline = '1px solid #fff';
    };
    el.onmouseleave = () => {
      if (!this.selectable || this.lit) return;
      el.style.outline = '';
    };

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
    el.style.borderRadius = `${radius}px`;
    el.style.fontSize = `${radius + 3}px`;
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
    this._el.style.cursor = this._selectable ? 'pointer' : 'default';
  }

  public get selectable() { return this._selectable; }

  public set selected(value: boolean) {
    if (!this.selectable) {
      return;
    }
    if (this._selected == value) return;
    this._selected = value;
    this._el.style.opacity = (this._selected ? 0.5 : 1).toString();
  }

  public get selected() { return this._selected; }

  public setLit(lit: boolean) {
    if (this._lit == lit) return;
    this._lit = lit;
    this._el.style.outline = lit ? '1px solid #fff' : '';
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
