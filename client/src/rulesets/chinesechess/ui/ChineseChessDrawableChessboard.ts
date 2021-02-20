import { configManager } from "src/boot/main";
import { ConfigItem } from "src/config/ConfigManager";
import Chess from "src/rulesets/chinesechess/Chess";
import Chessboard from "src/rulesets/chinesechess/chessboard";
import ChessPos from "src/rulesets/chinesechess/ChessPos";
import Signal from "src/utils/signals/Signal";
import DrawableChessboard from "src/rulesets/ui/DrawableChessboard";
import DrawableChess from "./DrawableChess";

export default class ChineseChessDrawableChessboard
  extends DrawableChessboard implements Chessboard {
  private _bounds: ChessboardBounds;

  public get bounds() { return this._bounds; }

  public readonly chessPickupOrDrop: Signal = new Signal();

  public readonly chessPosClicked: Signal = new Signal();

  public readonly chessMoved: Signal = new Signal();

  private canvas: HTMLCanvasElement;

  private readonly padding = 4;

  private chessArray: Array<Array<DrawableChess | null>>;

  constructor(stage: {width: number, height: number}, screen: any) {
    super();
    // eslint-disable-next-line
    this.chessArray = new Array(10);
    for (let row = 0; row < 10; row++) {
      // eslint-disable-next-line
      this.chessArray[row] = new Array(9);
      for (let col = 0; col < 9; col++) {
        // eslint-disable-next-line
        this.chessArray[row][col] = null;
      }
    }

    this.load(stage, screen);
  }

  private load(stage: {width: number, height: number}, screen: any) {
    const el = document.createElement('div');
    this._el = el;
    el.className = 'chessboard chinese-chess-chessboard';
    el.style.position = 'relative';
    el.style.padding = `${this.padding}px`;
    el.style.borderRadius = '4px';

    const drawBackground = () => {
      const isDark = configManager.get(ConfigItem.theme) == 'dark';
      this.el.style.background = isDark ? 'transparent' : '#ecbe79';
    };
    drawBackground();
    configManager.changed.add((key: string) => {
      if (key == ConfigItem.theme) {
        drawBackground();
      }
    });

    el.onclick = this.onClick.bind(this);

    this.setupDragable();

    const canvas = document.createElement('canvas');
    this.canvas = canvas;
    el.appendChild(canvas);

    this.resizeAndDraw(stage, screen);
  }

  public resizeAndDraw(stage: {width: number, height: number}, screen: any) {
    this.calcBounds(stage, screen);

    const el = this._el;
    const { width, height } = this.bounds.canvas;
    el.style.width = `${width + this.padding * 2}px`;
    el.style.height = `${height + this.padding * 2}px`;

    this.draw(this.canvas, screen);

    this.getChessList().forEach((chess: DrawableChess) => {
      chess.resizeAndDraw(this.bounds.chessRadius);
      const { x, y } = this.calcChessDisplayPos(chess.getPos());
      chess.x = x;
      chess.y = y;
    });
  }

  private setupDragable() {
    const el = this._el;

    // 接收拖拽
    el.ondragover = (event) => {
      event.preventDefault();
    };
    // 放置
    el.ondrop = (event) => {
      const data: string[] = event.dataTransfer?.getData('chess-pos').split(',') as string[];
      const fromPos = new ChessPos(+data[0], +data[1]);
      let toPos: ChessPos;
      if ((event.target as HTMLElement).classList.contains('chess')) {
        const target = this.getChessList().find((chess: DrawableChess) => chess.el == event.target);
        toPos = target?.getPos() as ChessPos;
      } else {
        toPos = this.chessPosFromInputEvent(event);
      }
      this.chessMoved.dispatch({
        chess: this.chessAt(fromPos),
        toPos,
      });
    };
  }

  private onClick(event: MouseEvent) {
    this.clicked.dispatch(event);

    const pos = this.chessPosFromInputEvent(event);
    const args = { pos, chess: this.chessAt(pos) };

    this.chessPosClicked.dispatch(args);
  }

  private chessPosFromInputEvent(event: DragEvent | MouseEvent) {
    const targetEl = event.target as HTMLElement;
    if (targetEl.classList.contains('chess-target')) {
      const data: string[] = targetEl.getAttribute('chess-pos')?.split(',') as string[];
      return new ChessPos(+data[0], +data[1]);
    }

    // 当放置目标是棋盘时, 事件offsetX/Y才准确
    const { offsetX, offsetY } = event;
    const { bounds } = this;
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
    const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (context == null) return;

    const { grid } = this.bounds;

    const pixelRatio = (() => {
      // eslint-disable-next-line
      const ctx: any = context;
      // eslint-disable-next-line
      const backingStore = ctx.backingStorePixelRatio ||
      // eslint-disable-next-line
      ctx.webkitBackingStorePixelRatio ||
      // eslint-disable-next-line
      ctx.mozBackingStorePixelRatio ||
      // eslint-disable-next-line
      ctx.msBackingStorePixelRatio ||
      // eslint-disable-next-line
      ctx.oBackingStorePixelRatio ||
      // eslint-disable-next-line
      ctx.backingStorePixelRatio || 1;
      return (window.devicePixelRatio || 1) / backingStore;
    })();

    const canvasBounds = this.bounds.canvas;
    canvas.style.width = `${canvasBounds.width}px`;
    canvas.style.height = `${canvasBounds.height}px`;
    canvas.width = canvasBounds.width * pixelRatio;
    canvas.height = canvasBounds.height * pixelRatio;
    context.scale(pixelRatio, pixelRatio);

    /// 画棋盘网格线
    const drawLine = (
      x1: number, y1: number,
      x2: number, y2: number,
      color?: string,
      lineWidth?: number,
    ) => {
      context.beginPath();
      // eslint-disable-next-line
      context.lineWidth = lineWidth || (screen.xs ? 1 : 2);
      context.moveTo(grid.x + x1, grid.y + y1);
      context.lineTo(grid.x + x2, grid.y + y2);
      context.closePath();
      context.strokeStyle = color || '#9a6d32';
      context.stroke();
    };

    const drawXLine = (baseRow: number, startCol: number, endCol: number) => {
      const y = baseRow * grid.gap;
      const startX = startCol * grid.gap;
      const endX = endCol * grid.gap;
      drawLine(startX, y, endX, y);
    };

    const drawYLine = (baseCol: number, startRow: number, endRow: number) => {
      const x = baseCol * grid.gap;
      const startY = startRow * grid.gap;
      const endY = endRow * grid.gap;
      drawLine(x, startY, x, endY);
    };

    drawYLine(0, 0, 9);
    drawYLine(8, 0, 9);
    for (let col = 1; col < 8; col++) {
      drawYLine(col, 0, 4);
      drawYLine(col, 5, 9);
    }
    for (let row = 0; row < 10; row++) {
      drawXLine(row, 0, 8);
    }

    // 画中间九宫的斜线
    const drawXGraph = (row: number) => {
      const x1 = 3 * grid.gap;
      const x2 = 5 * grid.gap;
      const baseY = grid.gap * row;
      drawLine(x1, baseY, x2, baseY + 2 * grid.gap);
      drawLine(x1, baseY + 2 * grid.gap, x2, baseY);
    };
    drawXGraph(0);
    drawXGraph(7);

    // 画十字
    (() => {
      /**
       * 画一个十字
       * @param cx 中心点x
       * @param cy 中心点y
       * @param indexs 十字图形索引，0到3分别表示左上,右上,右下,左下
       */
      const drawCross = (cx: number, cy: number, indexs: number[] = [0, 1, 2, 3]) => {
        // eslint-disable-next-line
        const m = screen.xs ? 2 : 4; // 距离中心点
        const l = 4; // 十字长度
        const dt = [[-1, -1], [+1, -1], [+1, +1], [-1, +1]];
        indexs.forEach((i) => {
          const [xf, yf] = dt[i];
          const x = cx + m * xf;
          const y = cy + m * yf;
          // eslint-disable-next-line
          const lineWidth = screen.xs ? 1 : 1.5;
          drawLine(x, y, x + l * xf, y, undefined, lineWidth);
          drawLine(x, y, x, y + l * yf, undefined, lineWidth);
        });
      };
      const drawCrossAt = (row: number, col: number, indexs?: number[]) => {
        drawCross(grid.gap * col, grid.gap * row, indexs);
      };

      drawCrossAt(2, 1);
      drawCrossAt(2, 7);
      drawCrossAt(7, 1);
      drawCrossAt(7, 7);
      for (let p = 0; p < 2; p++) {
        const row = 3 + p * 3;
        drawCrossAt(row, 0, [1, 2]);
        drawCrossAt(row, 2);
        drawCrossAt(row, 4);
        drawCrossAt(row, 6);
        drawCrossAt(row, 8, [0, 3]);
      }
    })();
  }

  private calcBounds(stage: {width: number, height: number}, screen: any) {
    const MIN_SIZE = 240;
    const MAX_SIZE = 800;

    // 计算匹配屏幕的画布的宽度
    let narrow = Math.min(stage.width, stage.height);
    narrow -= this.padding * 2;
    if (narrow > MAX_SIZE) {
      narrow = MAX_SIZE;
    }
    if (narrow < MIN_SIZE) {
      narrow = MIN_SIZE;
    }

    // 根据网格宽度计算交叉点之间的距离
    const gap = narrow / (stage.height < stage.width ? 10 : 9);
    // 棋子宽度稍小于交叉点距离
    // eslint-disable-next-line
    const chessSize = gap - (screen.xs ? 4 : 12);
    // 最侧边的棋子需要占据半个位置
    const gridMargin = gap / 2;
    const canvasWidth = Math.floor(gap * 8 + gridMargin * 2);
    const canvasHeight = Math.floor(gap * 9 + gridMargin * 2);

    this._bounds = {
      canvas: {
        width: canvasWidth,
        height: canvasHeight,
      },
      grid: {
        x: Math.round(gridMargin),
        y: Math.round(gridMargin),
        gap: Math.round(gap),
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
    const ret: Array<DrawableChess> = [];
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
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
    const { x, y } = this.calcChessDisplayPos(chess.getPos());
    chess.x = x;
    chess.y = y;

    chess.clicked.removeAll();
    chess.pickup.removeAll();
    chess.drop.removeAll();

    chess.clicked.add(() => {
      this.chessPosClicked.dispatch({ chess, pos: chess.getPos() });
    });
    chess.pickup.add(() => {
      this.chessPickupOrDrop.dispatch({ chess, isPickup: true });
    });
    chess.drop.add(() => {
      this.chessPickupOrDrop.dispatch({ chess, isPickup: false });
    });
    this._el.appendChild(chess.el);
  }

  public clear() {
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        const chess = this.chessAt(new ChessPos(row, col));
        if (chess) {
          this.removeChess(chess);
        }
      }
    }
  }

  public calcChessDisplayPos(pos: ChessPos) {
    const { grid } = this.bounds;
    const x = grid.x + this.padding + pos.col * grid.gap;
    const y = grid.y + this.padding + pos.row * grid.gap;
    return { x, y };
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
    gap: number
  },
  chessRadius: number,
}
