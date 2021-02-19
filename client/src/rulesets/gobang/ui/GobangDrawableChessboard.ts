import DrawableChessboard from "src/rulesets/ui/DrawableChessboard";
import DrawableChess from "./DrawableChess";
import ChessPos from "../ChessPos";
import Chessboard, { gridNumber } from "../Chessboard";
import './chessboard.scss';

export default class GobangDrawableChessboard extends DrawableChessboard {
  public chessboardState = new Chessboard();

  public sizes: ChessboardSizes;

  public onChessPosClick: (pos: ChessPos) => void;

  private canvas: HTMLCanvasElement;

  private chesses: DrawableChess[] = [];

  constructor(stage: {width: number, height: number}) {
    super();

    this._el = document.createElement('div');
    this.el.classList.add('chessboard', 'gobang-chessboard');

    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'chessboard_border';
    this.el.appendChild(canvasContainer);

    // 创建canvas
    const canvas = document.createElement('canvas');
    this.canvas = canvas;
    canvas.addEventListener('click', (event: MouseEvent) => {
      const { offsetX, offsetY } = event;
      const { cellSize } = this.sizes;
      const row = Math.round(offsetY / cellSize);
      const col = Math.round(offsetX / cellSize);
      this.clicked.dispatch();
      this.onChessPosClick(new ChessPos(row, col));
    });
    canvasContainer.appendChild(canvas);

    this.resizeAndDraw(stage);
  }

  public getChesses() {
    return this.chesses;
  }

  public chessAt(pos: ChessPos): DrawableChess | null {
    return this.chesses.find((drawableChess) => drawableChess.pos.equals(pos)) || null;
  }

  public removeChess(drawableChess: DrawableChess) {
    this.chesses = this.chesses.filter((ch) => ch != drawableChess);
    this.el.removeChild(drawableChess.el);
    this.chessboardState.setChess(drawableChess.pos, null);
  }

  public addChess(drawableChess: DrawableChess) {
    this.chesses.push(drawableChess);
    this.el.appendChild(drawableChess.el);
    drawableChess.appear();
    this.chessboardState.setChess(drawableChess.pos, drawableChess.chess);
  }

  public clear(): void {
    this.chesses.forEach((chess) => {
      this.removeChess(chess);
    });
    this.chessboardState.clear();
  }

  public resizeAndDraw(stage: {width: number, height: number}) {
    const size = Math.min(stage.width, stage.height);
    const borderWidth = 2;
    // 棋盘canvas尺寸
    let canvasSize = size - (borderWidth * 2);
    // 格子尺寸
    const cellSize = Math.round(canvasSize / gridNumber);
    const diff = canvasSize - cellSize * gridNumber;
    canvasSize = cellSize * gridNumber;
    // 棋盘内边距
    const padding = cellSize / 2 + Math.round(diff / 2);

    this.sizes = {
      size: canvasSize - cellSize,
      padding: padding + borderWidth,
      cellSize,
    };

    this.el.style.padding = `${padding}px`;
    this.el.style.width = `${size}px`;
    this.el.style.height = `${size}px`;

    this.draw();

    this.chesses.forEach((chess) => {
      chess.resizeAndDraw(this.sizes);
    });
  }

  private draw() {
    const { canvas } = this;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const { size, cellSize } = this.sizes;

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
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    canvas.width = size * pixelRatio;
    canvas.height = size * pixelRatio;
    context.scale(pixelRatio, pixelRatio);

    // 画网格
    context.lineWidth = 1;
    for (let i = 1; i <= gridNumber; i++) {
      // 画横线
      const y = i * cellSize;
      context.moveTo(0, y);
      context.lineTo(size, y);

      // 画竖线
      const x = i * cellSize;
      context.moveTo(x, 0);
      context.lineTo(x, size);
    }
    context.strokeStyle = '#ecb16a';
    context.stroke();

    // 画圆点
    context.fillStyle = "#ecaa5b";
    [
      [3, 3], [11, 3],
      [(gridNumber - 1) / 2, (gridNumber - 1) / 2],
      [3, 11], [11, 11],
    ].forEach(([row, col]) => {
      context.beginPath();
      context.arc(
        cellSize * row,
        cellSize * col,
        4, 0, Math.PI * 2, true,
      );
      context.closePath();
      context.fill();
    });
  }
}

export interface ChessboardSizes {
  /**
   * 棋盘正方形的尺寸
   */
  size: number;
  /**
   * 内边距
   */
  padding: number;
  /**
   * 格子的大小
   */
  cellSize: number;

}
