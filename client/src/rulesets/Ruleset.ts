import GameState from "src/online/play/GameState";
import Bindable from "src/utils/bindables/Bindable";
import GameUser from "src/online/play/GameUser";
import UserPlayInput from "./UserPlayInput";
import GameRule from "./GameRule";
import RulesetClient from "./RulesetClient";
import DrawableChessboard from "./ui/DrawableChessboard";
import GameSettings from "./GameSettings";
import RulesetPlayer from "./RulesetPlayer";

export default abstract class Ruleset {
  public gameSettings: GameSettings;

  public abstract createUserPlayInput(
    game: GameRule,
    gameState: Bindable<GameState>,
    localUser: GameUser,
    isWatchingMode: boolean,
  ): UserPlayInput;

  public abstract createGameRule(): GameRule;

  public abstract createRulesetClient(game: GameRule): RulesetClient;

  public abstract createChessboard(
    stage: {width: number, height: number}, screen: any): DrawableChessboard;

  public abstract createPlayer(): RulesetPlayer;
}
