import ChineseChessDrawableChessboard from "./ChineseChessDrawableChessboard";
import StatusCircle from "./StatusCircle";

export default class StatusCirclePool {
  private chessboard: ChineseChessDrawableChessboard;

  private array: StatusCircle[] = [];

  private usedArray: StatusCircle[] = [];

  private countGet = 0;

  constructor(chessboard: ChineseChessDrawableChessboard) {
    this.chessboard = chessboard;

    this.grow();
  }

  public get() {
    if (this.countGet + 1 > this.array.length) {
      this.grow();
    }
    return this.array[this.countGet++];
  }

  public markAsUsed(statusCircle: StatusCircle, used: boolean) {
    if (used) {
      this.usedArray.push(statusCircle);
    } else {
      this.usedArray = this.usedArray.filter((item) => item != statusCircle);
    }
  }

  public getUsed() {
    return this.usedArray;
  }

  private grow() {
    for (let n = 0; n < 10; n++) {
      const statusCircle = new StatusCircle(this.chessboard);
      this.array.push(statusCircle);
      this.chessboard.el.appendChild(statusCircle.el);
    }
  }
}
