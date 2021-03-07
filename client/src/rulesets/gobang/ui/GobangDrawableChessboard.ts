import DrawableChessboard from "src/rulesets/ui/DrawableChessboard";
import DrawableChess from "./DrawableChess";
import ChessPos from "../ChessPos";
import './chessboard.scss';

export default class GobangDrawableChessboard extends DrawableChessboard {
  public sizes: ChessboardSizes;

  public onChessPosClick: (pos: ChessPos) => void;

  public onChessPosHover: (pos: ChessPos) => void;

  private gridNumber: number;

  public canvas: HTMLCanvasElement;

  private chesses: DrawableChess[] = [];

  constructor(stage: {width: number, height: number}, gridNumber: number) {
    super();
    this.gridNumber = gridNumber;

    this._el = document.createElement('div');
    this.el.classList.add('chessboard', 'gobang-chessboard');

    // 创建canvas
    const canvas = document.createElement('canvas');
    this.canvas = canvas;
    canvas.addEventListener('click', (event: MouseEvent) => {
      if (!this.onChessPosClick) {
        return;
      }
      this.clicked.dispatch();
      const chessPos = this.chessPosFromMouseEvent(event);
      this.onChessPosClick(chessPos);
    });
    this.el.appendChild(canvas);

    canvas.addEventListener('mousemove', (event: MouseEvent) => {
      if (!this.onChessPosHover) {
        return;
      }

      const chessPos = this.chessPosFromMouseEvent(event);
      this.onChessPosHover(chessPos);
    });

    this.resizeAndDraw(stage);
  }

  public getChesses() {
    return this.chesses;
  }

  public chessAt(pos: ChessPos): DrawableChess | null {
    return this.chesses.find((drawableChess) => drawableChess.pos?.equals(pos)) || null;
  }

  public removeChess(drawableChess: DrawableChess) {
    this.chesses = this.chesses.filter((ch) => ch != drawableChess);
    this.el.removeChild(drawableChess.el);
  }

  public addChess(drawableChess: DrawableChess) {
    this.chesses.push(drawableChess);
    this.el.appendChild(drawableChess.el);
  }

  public clear(): void {
    this.chesses.forEach((chess) => {
      this.removeChess(chess);
    });
  }

  public resizeAndDraw(stage: {width: number, height: number}) {
    const size = Math.min(stage.width, stage.height);
    const padding = 4 * 2;
    let canvasSize = size - padding;
    // 格子尺寸
    const cellSize = Math.round(canvasSize / this.gridNumber);
    const diff = canvasSize - cellSize * this.gridNumber;
    canvasSize = cellSize * this.gridNumber;
    const diffToPadding = Math.round(diff / 2);

    this.sizes = {
      canvasSize,
      gridMargin: cellSize / 2,
      cellSize,
      gap: 2,
      gridStart: cellSize / 2 + padding / 2 + diffToPadding,
    };

    this.canvas.style.padding = `${diffToPadding}px`;
    this.el.style.width = `${size}px`;
    this.el.style.height = `${size}px`;

    this.draw();

    this.chesses.forEach((chess) => {
      chess.draw(this.sizes);
    });
  }

  private draw() {
    const { canvas } = this;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const { canvasSize, gridMargin, cellSize } = this.sizes;

    const pixelRatio = (() => {
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
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;
    canvas.width = canvasSize * pixelRatio;
    canvas.height = canvasSize * pixelRatio;
    context.scale(pixelRatio, pixelRatio);

    // 画网格
    context.lineWidth = 1;
    for (let i = 0; i < this.gridNumber; i++) {
      // 画横线
      const y = gridMargin + i * cellSize;
      context.moveTo(gridMargin, y);
      context.lineTo(canvasSize - gridMargin, y);

      // 画竖线
      const x = gridMargin + i * cellSize;
      context.moveTo(x, gridMargin);
      context.lineTo(x, canvasSize - gridMargin);
    }
    context.strokeStyle = '#a25e0b';
    context.stroke();

    // 画圆点
    context.fillStyle = "#98590b";
    const start = this.gridNumber < 11 ? 2 : 3;
    const quarter = Math.floor((this.gridNumber - start * 2) / 2);
    const posArray = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        posArray.push([start + quarter * r, start + quarter * c]);
      }
    }
    posArray.forEach(([row, col]) => {
      context.beginPath();
      context.arc(
        gridMargin + cellSize * row,
        gridMargin + cellSize * col,
        4, 0, Math.PI * 2, true,
      );
      context.closePath();
      context.fill();
    });
  }

  private chessPosFromMouseEvent(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    const { cellSize, gridMargin } = this.sizes;
    let row = Math.round((offsetY - gridMargin) / cellSize);
    let col = Math.round((offsetX - gridMargin) / cellSize);
    if (row < 0) { row = 0; }
    if (col < 0) { col = 0; }
    if (row >= this.gridNumber) { row = this.gridNumber - 1; }
    if (col >= this.gridNumber) { col = this.gridNumber - 1; }
    return new ChessPos(row, col);
  }
}

export interface ChessboardSizes {
  canvasSize: number;

  gridMargin: number;

  cellSize: number;

  gap: number;

  gridStart: number;
}
