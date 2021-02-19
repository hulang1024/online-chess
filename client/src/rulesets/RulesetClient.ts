import Playfield from "src/pages/play/Playfield";
import GameRule from "./GameRule";

export default abstract class RulesetClient {
  public game: GameRule;

  public playfield: Playfield;

  constructor(game: GameRule) {
    this.game = game;
  }

  public abstract exit(): void;
}
