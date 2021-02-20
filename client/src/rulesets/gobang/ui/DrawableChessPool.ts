import DrawableChess from "src/rulesets/gobang/ui/DrawableChess";
import GobangDrawableChessboard from "./GobangDrawableChessboard";

export default class DrawableChessPool {
  private drawableChesses: DrawableChess[] = [];

  private chessboard: GobangDrawableChessboard;

  constructor(chessboard: GobangDrawableChessboard) {
    this.chessboard = chessboard;
  }

  public add() {
    const drawableChess = new DrawableChess();
    this.drawableChesses.push(drawableChess);
    this.chessboard.addChess(drawableChess);
  }

  public get() {
    return this.drawableChesses.pop();
  }
}
