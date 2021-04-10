import Chess from 'src/rulesets/chinesechess/rule/Chess';
import ChessPos from 'src/rulesets/chinesechess/rule/ChessPos';
import ChessHost from 'src/rulesets/chess_host';
import { chessClassToText } from 'src/rulesets/chinesechess/rule/chess_map';
import Game from 'src/rulesets/chinesechess/rule/Game';
import Signal from 'src/utils/signals/Signal';
import { configManager } from 'src/boot/main';
import { ConfigItem } from 'src/config/ConfigManager';
import './chess.scss';
import './themes/chess/index.scss';
import ChessboardState from '../rule/ChessboardState';

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

  private supportDraggable: boolean;

  constructor(chess: Chess, radius: number) {
    this.chess = chess;
    this.radius = radius;
    this.load();
  }

  private load() {
    const el = document.createElement('div');
    this._el = el;
    const colorClass = this.chess.getHost() == ChessHost.FIRST ? 'red' : 'black';
    el.classList.add('chinesechess-chess', colorClass);
    el.style.lineHeight = `${this.radius * 2}px`;

    const front = document.createElement('div');
    front.classList.add('side', 'front');

    const circle1 = document.createElement('div');
    circle1.className = 'chess__circle';

    front.appendChild(circle1);

    el.appendChild(front);

    if (this.chess.isFront()) {
      // 防止审查DOM作弊，当初始值是正面才显示字
      this.drawFront();
    } else {
      this.el.classList.add('is-back');
    }

    const back = document.createElement('div');
    back.classList.add('side', 'back');

    const circle2 = document.createElement('div');
    circle2.className = 'chess__circle';
    back.appendChild(circle2);

    el.appendChild(back);

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
      this.selected = false;
      this.drop.dispatch();
    };

    this.supportDraggable = configManager.get(ConfigItem.chinesechessChessDraggable) as boolean;
    this.resetTheme();
    configManager.changed.add(this.onConfigChanged, this);
  }

  public resizeAndDraw(radius: number) {
    const el = this._el;
    el.style.width = `${radius * 2}px`;
    el.style.height = `${radius * 2}px`;
    el.style.fontSize = `${radius + 4}px`;
    el.classList[radius <= 16 ? 'add' : 'remove']('smaller');
    const frontCircle = el.children[0].firstChild as HTMLDivElement;
    const bordersideWidth = Math.min(18, radius * 0.7);
    frontCircle.style.top = `-${radius * 0.18}px`;
    frontCircle.style.width = `calc(100% - ${bordersideWidth}px)`;
    frontCircle.style.height = `calc(100% - ${bordersideWidth}px)`;
    const backCircle = el.children[1].firstChild as HTMLDivElement;
    const backBordersideWidth = Math.round(radius * 0.5);
    backCircle.style.top = `-${Math.round(radius * 0.1)}px`;
    backCircle.style.width = `calc(100% - ${backBordersideWidth}px)`;
    backCircle.style.height = `calc(100% - ${backBordersideWidth}px)`;
    this.radius = radius;

    el.style.setProperty('--side-shadow-offset', `${bordersideWidth * 0.55}px`);
    el.style.setProperty('--side-shadow-offset-overlay', `${bordersideWidth}px`);
  }

  public set x(val: number) {
    this._el.style.left = `${Math.round(val - this.radius)}px`;
  }

  public get x() { return this._el.offsetLeft + this.radius; }

  public set y(val: number) {
    this._el.style.top = `${Math.round(val - this.radius)}px`;
  }

  public get y() { return this._el.offsetTop + this.radius; }

  public set selectable(val: boolean) {
    this._selectable = val;
    if (this.supportDraggable) {
      this._el.draggable = val;
    }
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

  public canGoTo(destPos: ChessPos, chessboardState: ChessboardState, game: Game) {
    return this.chess.canGoTo(destPos, chessboardState, game);
  }

  public setPos(pos: ChessPos) {
    this.chess.setPos(pos);
  }

  public getPos() {
    return this.chess.getPos();
  }

  public setHost(host: ChessHost) {
    this.chess.setHost(host);
  }

  public getHost() {
    return this.chess.getHost();
  }

  /**
   * 从反面翻转到正面
   */
  public flipToFront() {
    if (this.chess.isFront()) {
      return;
    }
    this.chess.setFront(true);
    this.el.classList.remove('is-back');
  }

  public drawFront() {
    const frontEl = (this.el.children[0] as HTMLDivElement);
    (frontEl.firstChild as HTMLDivElement).innerText = chessClassToText(this.chess);
  }

  // eslint-disable-next-line
  public setFront(isFront: boolean) {
    throw Error('不支持调用');
  }

  public isFront() {
    return this.chess.isFront();
  }

  public clone(): Chess {
    return this.chess.clone();
  }

  public is(chessClass: unknown) {
    return this.chess.is(chessClass);
  }

  public destroy() {
    configManager.changed.remove(this.onConfigChanged, this);
  }

  private onConfigChanged(key: string, value: unknown) {
    if (key == ConfigItem.chinesechessChessDraggable) {
      this.supportDraggable = value as boolean;
      if (this.selectable) {
        this.el.draggable = value as boolean;
      }
    }
    if (key == ConfigItem.chinesechessChessTheme) {
      this.resetTheme();
    }
  }

  private resetTheme() {
    const { el } = this;
    const theme = configManager.get(ConfigItem.chinesechessChessTheme) as string;
    el.classList.forEach((cls) => {
      if (cls.startsWith('theme-')) {
        el.classList.remove(cls);
      }
    });
    el.classList.add(`theme-${theme}`);
  }
}
