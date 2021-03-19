import ChineseChessDrawableChessboard from "./ChineseChessDrawableChessboard";
import StatusCircle from "./StatusCircle";

export default class StatusCirclePool {
  private chessboard: ChineseChessDrawableChessboard;

  private notUsedArray: StatusCircle[] = [];

  private usedArray: StatusCircle[] = [];

  constructor(chessboard: ChineseChessDrawableChessboard) {
    this.chessboard = chessboard;

    this.grow();
  }

  public getNotUsed() {
    if (this.notUsedArray.length <= 1) {
      this.grow();
    }
    return this.notUsedArray.pop() as StatusCircle;
  }

  public markAsUsed(statusCircle: StatusCircle, used: boolean) {
    if (used) {
      this.usedArray.push(statusCircle);
    } else {
      this.usedArray = this.usedArray.filter((item) => item != statusCircle);
      this.notUsedArray.push(statusCircle);
    }
  }

  public getUsedArray() {
    return this.usedArray;
  }

  private grow() {
    for (let n = 0; n < 10; n++) {
      const statusCircle = new StatusCircle(this.chessboard);
      this.notUsedArray.push(statusCircle);
      this.chessboard.el.appendChild(statusCircle.el);
    }
  }
}
