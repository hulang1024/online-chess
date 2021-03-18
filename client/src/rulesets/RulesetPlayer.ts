import GameRule from "./GameRule";
import UserPlayInput from "./UserPlayInput";

export default abstract class RulesetPlayer {
  public context: Vue;

  public game: GameRule;

  public userPlayInput: UserPlayInput;

  public abstract openSettings(): void;

  public abstract openHelp(): void;
}
