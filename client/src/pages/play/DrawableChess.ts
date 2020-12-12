import Chess from 'src/rule/Chess';
import ChessC from 'src/rule/chess/ChessC';
import ChessG from 'src/rule/chess/ChessG';
import ChessK from 'src/rule/chess/ChessK';
import ChessM from 'src/rule/chess/ChessM';
import ChessN from 'src/rule/chess/ChessN';
import ChessR from 'src/rule/chess/ChessR';
import ChessS from 'src/rule/chess/ChessS';
import ChessPos from 'src/rule/ChessPos';
import ChessHost from 'src/rule/chess_host';
import Game from 'src/rule/Game';
import Signal from 'src/utils/signals/Signal';

export default class DrawableChess implements Chess {
  private _el: HTMLDivElement;
  public get el() { return this._el; }

  private _enabled: boolean = false;
  public get enabled() { return this._enabled; }

  private _selected: boolean = false;
  public get selected() { return this._selected; }

  private _lit: boolean = false;
  public get lit() { return this._lit; }

  public readonly drop: Signal = new Signal();
  public readonly pickup: Signal = new Signal();
  public readonly clicked: Signal = new Signal();

  public readonly chess: Chess;

  private radius: number;
  
  constructor(chess: Chess, radius: number, theme: string) {
    this.chess = chess;
    this.radius = radius;
    this.load(theme);
  }

  private load(theme: string) {
    let el = document.createElement('div');
    this._el = el;
    el.className = 'chess shadow-3';
    el.style.position = 'absolute';
    el.style.display = 'flex';
    el.style.justifyContent = 'center';
    el.style.alignItems = 'center';
    el.style.backgroundColor = this.chess.getHost() == ChessHost.RED ? '#dd1100' : '#443322';
    el.style.userSelect = 'none';
    el.style.color = '#f6f6f6';
    el.style.outlineOffset = '4px';
    el.style.fontWeight = 'bolder';
    el.style.textAlign = 'center';
    el.style.lineHeight = this.radius * 2 + 'px';
    el.innerText = chessClassToKey(this.chess);

    el.onmouseenter = () => {
      if (!this.enabled || this.lit || this.selected) return;
      el.style.outline = '1px solid #fff';
    };
    el.onmouseleave = () => {
      if (!this.enabled || this.lit) return;
      el.style.outline = '';
    };

    this.setupDragable();
    
    el.onclick = (event) => {
      if (!this._enabled) {
        return;
      }
      event.stopPropagation();
      this.clicked.dispatch(this);
      return false;
    };

    this.resizeAndDraw(this.radius);
  }

  private setupDragable() {
    let el = this._el;
    el.ondragstart = (event) => {
      this.selected = true;
      this.pickup.dispatch();
      const { row, col } = this.getPos();
      // 此处传递是哪个棋子被拖拽，但是传递值只能是字符串因此传递位置
      event.dataTransfer?.setData('chess-pos', `${row},${col}`);
    };
    el.ondragend = (event) => {
      el.style.outline = '';
      this.selected = false;
      this.drop.dispatch();
    };
  }

  public resizeAndDraw(radius: number) {
    let el = this._el;
    el.style.width = `${radius * 2}px`;
    el.style.height = `${radius * 2}px`;
    el.style.borderRadius = radius + 'px';
    el.style.fontSize = radius + 3 + 'px';
    this.radius = radius;
  }

  public get x() { return this._el.offsetLeft + this.radius; }
  public get y() { return this._el.offsetTop + this.radius; }

  public set x(val: number) {
    this._el.style.left = val - this.radius + 'px';
  }
  
  public set y(val: number) {
    this._el.style.top = val - this.radius + 'px';
  }

  public set enabled(val: boolean) {
    this._enabled = val;
    this._el.draggable = val;
    this._el.style.cursor = this._enabled ? 'pointer' : 'default';
  }

  public set selected(value: boolean) {
    if (this._selected == value) return;
    this._selected = value;
    this._el.style.opacity = (this._selected ? 0.5 : 1) + '';
  }

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

  public is(chessClass: Function) {
    return this.chess.is(chessClass);
  }
}

function chessClassToKey(chess: Chess) {
  let text: string[] = [];
  if (chess instanceof ChessC) text = ['炮', '炮'];
  if (chess instanceof ChessG) text = ['士', '士'];
  if (chess instanceof ChessK) text = ['帅', '将'];
  if (chess instanceof ChessM) text = ['相', '象'];
  if (chess instanceof ChessN) text = ['馬', '馬'];
  if (chess instanceof ChessR) text = ['車', '車'];
  if (chess instanceof ChessS) text = ['兵', '卒'];
  return text[chess.getHost() - 1];
}