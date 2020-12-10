import Chess from "src/rule/Chess";
import Chessboard, { CHESSBOARD_COL_NUM, CHESSBOARD_ROW_NUM } from "src/rule/chessboard";
import ChessPos from "src/rule/ChessPos";
import Signal from "src/utils/signals/Signal";
import DrawableChess from "./DrawableChess";

export default class DrawableChessboard implements Chessboard {
  private _el: HTMLDivElement;
  public get el() { return this._el; }

  private _bounds: ChessboardBounds;
  public get bounds() { return this._bounds };

  public enabled: boolean = false;
  public readonly chessPickupOrDrop: Signal = new Signal();
  public readonly clicked: Signal = new Signal();
  public readonly chessMoved: Signal = new Signal();
  private canvas: HTMLCanvasElement;
  private readonly padding = 4;
  private chessArray: Array<Array<DrawableChess | null>> = new Array(CHESSBOARD_ROW_NUM);

  constructor(stageWidth: number, screen: any, theme: string) {
    for (let row = 0; row < CHESSBOARD_ROW_NUM; row++) {
      this.chessArray[row] = new Array(CHESSBOARD_COL_NUM);
      for (let col = 0; col < CHESSBOARD_COL_NUM; col++) {
          this.chessArray[row][col] = null;
      }
    }

    this.load(stageWidth, screen, theme);
  }

  private load(stageWidth: number, screen: any, theme: string) {
    let el = document.createElement('div');
    this._el = el;
    el.className = 'chessboard';
    el.style.position = 'relative';
    el.style.padding = `${this.padding}px`;
    el.style.borderRadius = '4px';
    el.style.background = '#e8b161';
    el.onclick = this.onClick.bind(this);

    this.setupDragable();

    let canvas = document.createElement('canvas');
    this.canvas = canvas;
    el.appendChild(canvas);

    this.resizeAndDraw(stageWidth, screen);
  }

  public resizeAndDraw(stageWidth: number, screen: any) {
    this.calcBounds(stageWidth, screen);

    let el = this._el;
    const { width, height } = this.bounds.canvas;
    el.style.width = width + this.padding * 2 + 'px';
    el.style.height = height + this.padding * 2 + 'px';

    this.draw(this.canvas, screen);

    this.getChessList().forEach((chess: DrawableChess) => {
      chess.resizeAndDraw(this.bounds.chessRadius);
      const {x, y} = this.calcChessDisplayPos(chess.getPos());
      chess.x = x;
      chess.y = y;
    });
  }

  private setupDragable() {
    let el = this._el;

    // 接收拖拽
    el.ondragover = (event) => {
      let allowed = true;
      if (allowed) {
        event.preventDefault();
      }
    };
    // 放置
    el.ondrop = (event) => {
      let data: any = event.dataTransfer?.getData('chess-pos').split(',');
      let fromPos = new ChessPos(+data[0], +data[1]);
      let toPos: ChessPos;
      let targetEl = event.target as HTMLElement;
      if (targetEl.classList.contains('chess')) {
        let target = this.getChessList().find(
          (chess: DrawableChess) => chess.el == event.target);
        toPos = target?.getPos() as ChessPos;
      } else if (targetEl.classList.contains('chess-target')) {
        let data: any = targetEl.getAttribute('chess-pos')?.split(',');
        toPos = new ChessPos(+data[0], +data[1]);
      } else {
        // 当放置目标是棋盘时, 事件offsetX/Y才准确
        toPos =  this.chessPosFromInputEvent(event);
      }
      this.chessMoved.dispatch({
        chess: this.chessAt(fromPos),
        toPos
      });
    };
  }

  onClick(event: any) {
    if (!this.enabled) {
      return;
    }
    let pos = this.chessPosFromInputEvent(event);

    let clickedArgs: any = {pos, chess: this.chessAt(pos)};

    if (clickedArgs.chess != null) {
      if (!clickedArgs.chess.enabled) {
        return;
      }
    }

    this.clicked.dispatch(clickedArgs);
  }

  private chessPosFromInputEvent(event: any) {
    let { offsetX, offsetY } = event;
    let bounds = this.bounds;
    let row: number;
    let col: number;
    if (offsetY < bounds.grid.y) {
      row = 0;
    } else if (offsetY > bounds.canvas.height - bounds.grid.y) {
      row = 9;
    } else {
      row = Math.round((offsetY - bounds.grid.y) / bounds.grid.gap);
    }
    if (offsetX < bounds.grid.x) {
      col = 0;
    } else if (offsetX > bounds.canvas.width - bounds.grid.x) {
      col = 8;
    } else {
      col = Math.round((offsetX - bounds.grid.x) / bounds.grid.gap);
    }
    return new ChessPos(row, col);
  }

  private draw(canvas: HTMLCanvasElement, screen: any) {
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (ctx == null) return;

    const { grid } = this.bounds;
    const pixelRatio = ((ctx: any) => {
      var backingStore = ctx.backingStorePixelRatio ||
      ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio || 1;
      return (window.devicePixelRatio || 1) / backingStore;
    })(ctx);

    const canvasBounds = this.bounds.canvas;
    canvas.style.width = canvasBounds.width + 'px';
    canvas.style.height = canvasBounds.height + 'px';
    canvas.width = canvasBounds.width * pixelRatio;
    canvas.height = canvasBounds.height * pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);

    /// 画棋盘网格
    const strokeLine = (x1: number, y1: number, x2: number, y2: number, color?: string) => {
      ctx.beginPath();
      ctx.lineWidth = screen.xs ? 1 : 2;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.strokeStyle = color || '#946830';
      ctx.stroke();
    };
  
    // 画内部格子
    for (let p = 0; p < 2; p++) {
      // 画横线
      for (let row = 0; row <= 5; row++) {
        let y = p * grid.height + grid.y + row * grid.gap;
        strokeLine(grid.x, y, grid.x + grid.width, y);
      }
  
      // 画竖线
      for (let col = 0; col < 9; col++) {
        let x = grid.x + col * grid.gap;
        let baseY = p * grid.height + p * grid.gap;
        strokeLine(x, baseY + grid.y, x, baseY + grid.y + grid.height);
      }
  
      // 画中间九宫的斜线
      let x1 = grid.x + 3 * grid.gap;
      let x2 = grid.x + 5 * grid.gap;
      let baseY = p * grid.height + p * 3 * grid.gap;
      strokeLine(x1, baseY + grid.y, x2, baseY + grid.y + 2 * grid.gap);
      strokeLine(x1, baseY + grid.y + 2 * grid.gap, x2, baseY + grid.y);

    }
    // 画竖线
    for (let s = 0; s < 2; s++) {
      let x = grid.x + s * grid.gap * 8;
      let baseY = grid.y + grid.height;
      strokeLine(x, baseY, x, baseY + grid.gap);
    }
  }

  private calcBounds(stageWidth: number, screen: any) {
    const MIN_WIDTH = 240;
    const MAX_WIDTH = 540;
  
    // 计算匹配屏幕的画布的宽度
    let width = stageWidth - this.padding * 2;
    if (width > MAX_WIDTH) {
      width = MAX_WIDTH;
    }
    if (width < MIN_WIDTH) {
      width = MIN_WIDTH;
    }

    const canvasWidth = width;
  
    // 根据网格宽度计算交叉点之间的距离
    const gap = canvasWidth / 9;
    // 棋子宽度稍小于交叉点距离
    const chessSize = gap - (screen.xs ? 4 : 12);

    const gridMargin = Math.round(gap / 2);// 最侧边的棋子需要占据半个位置

    // 高度有相同的交叉点距离
    const canvasHeight = Math.floor(gap * (10 - 1) + gridMargin * 2);

    this._bounds = {
      canvas: {
        width: canvasWidth,
        height: canvasHeight,
      },
      grid: {
        x: gridMargin,
        y: gridMargin,
        width: Math.round(gap * 8),
        height: Math.round(gap * (5 - 1)),
        gap: Math.round(gap)
      },
      chessRadius: Math.round(chessSize / 2),
    };
  }

  public isEmpty(row: number, col: number): boolean {
    return this.chessArray[row][col] == null;
  }

  public chessAt(pos: ChessPos): DrawableChess | null {
    return this.chessArray[pos.row][pos.col];
  }

  public getChessArray(): Array<Array<Chess | null>> {
    return this.chessArray;
  }

  public getChessList(): Array<DrawableChess> {
    let ret: Array<DrawableChess> = [];
    for (let row = 0; row < CHESSBOARD_ROW_NUM; row++) {
      for (let col = 0; col < CHESSBOARD_COL_NUM; col++) {
        if (!this.isEmpty(row, col)) {
          ret.push(this.chessArray[row][col] as DrawableChess);
        }
      }
    }
    return ret;
  }

  public removeChess(chess: DrawableChess) {
    this.chessArray[chess.getPos().row][chess.getPos().col] = null;
    return this._el.removeChild(chess.el);
  }

  public addChess(chess: DrawableChess) {
    this.chessArray[chess.getPos().row][chess.getPos().col] = chess;
    const {x, y} = this.calcChessDisplayPos(chess.getPos());
    chess.x = x;
    chess.y = y;
    // 可能重复加，删除之前绑定的处理器
    chess.clicked.remove(this.onChessClick, this);
    chess.clicked.add(this.onChessClick, this);
    chess.pickup.add(() => {
      this.chessPickupOrDrop.dispatch({chess, isPickup: true});
    });
    chess.drop.add(() => {
      this.chessPickupOrDrop.dispatch({chess, isPickup: false});
    });
    this._el.appendChild(chess.el);
  }

  private onChessClick(chess: Chess) {
    this.clicked.dispatch({chess, pos: chess.getPos()});
  }

  public calcChessDisplayPos(pos: ChessPos) {
    const { grid } = this.bounds;
    const x = grid.x + this.padding + pos.col * grid.gap;
    const y = grid.y + this.padding + pos.row * grid.gap;
    return {x, y};
  }
}

interface ChessboardBounds {
  canvas: {
    width: number,
    height: number,
  },
  grid: {
    x: number,
    y: number,
    width: number,
    height: number,
    gap: number
  },
  chessRadius: number,
};
