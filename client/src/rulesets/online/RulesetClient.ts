import Playfield from "src/pages/play/Playfield";
import GameRule from "../GameRule";
import UserPlayInput from "../UserPlayInput";

export default abstract class RulesetClient {
  public game: GameRule;

  public userPlayInput: UserPlayInput;

  public playfield: Playfield;

  constructor(game: GameRule) {
    this.game = game;
  }

  public abstract exit(): void;
}
