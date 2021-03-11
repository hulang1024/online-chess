import UserPlayInput from "./UserPlayInput";

export default abstract class RulesetPlayer {
  public context: Vue;

  public userPlayInput: UserPlayInput;

  public abstract openSettings(): void;

  public abstract openHelp(): void;
}
