import GameSettings from "../GameSettings";

export default class GobangGameSettings extends GameSettings {
  public chessboardSize = 15;

  constructor(chessboardSize?: number) {
    super();

    if (chessboardSize) {
      this.chessboardSize = chessboardSize;
    }
  }
}
