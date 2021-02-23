import GameState from "src/online/play/GameState";
import Bindable from "src/utils/bindables/Bindable";
import ChessHost from "../chess_host";
import ChineseChessGameRule from "./ChineseChessGameRule";
import ChineseChessClient from "./ChineseChessClient";
import ChineseChessUserPlayInput from "./ChineseChessUserPlayInput";
import GameRule from "../GameRule";
import Ruleset from "../Ruleset";
import ChineseChessDrawableChessboard from "./ui/ChineseChessDrawableChessboard";
import ChineseChessPlayer from "./ChineseChessPlayer";

export default class ChineseChessRuleset extends Ruleset {
  // eslint-disable-next-line
  public createUserPlayInput(
    game: GameRule,
    gameState: Bindable<GameState>,
    localChessHost: Bindable<ChessHost | null>,
    isWatchingMode: boolean,
  ) {
    return new ChineseChessUserPlayInput(
      game as ChineseChessGameRule,
      gameState,
      localChessHost,
      isWatchingMode,
    );
  }

  // eslint-disable-next-line
  public createGameRule() {
    return new ChineseChessGameRule();
  }

  // eslint-disable-next-line
  public createRulesetClient(game: GameRule) {
    return new ChineseChessClient(game);
  }

  // eslint-disable-next-line
  public createChessboard(stage: {width: number, height: number}, screen: any) {
    return new ChineseChessDrawableChessboard(stage, screen);
  }

  // eslint-disable-next-line
  public createPlayer() {
    return new ChineseChessPlayer();
  }
}
