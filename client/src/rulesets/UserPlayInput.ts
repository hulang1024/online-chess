import GameState from "src/online/play/GameState";
import GameUser from "src/online/play/GameUser";
import Bindable from "src/utils/bindables/Bindable";
import Signal from "src/utils/signals/Signal";
import GameRule from "./GameRule";

export default abstract class UserPlayInput {
  public inputDone = new Signal();

  public onReject: () => void;

  protected enabled = false;

  protected gameRule: GameRule;

  protected gameState: Bindable<GameState>;

  protected localUser: GameUser;

  protected playerView: Vue;

  protected gamepad: Vue;

  protected isWatchingMode: boolean;

  constructor(
    gameRule: GameRule,
    gameState: Bindable<GameState>,
    localUser: GameUser,
    isWatchingMode: boolean,
  ) {
    this.gameRule = gameRule;
    this.gameState = gameState;
    this.localUser = localUser;
    this.isWatchingMode = isWatchingMode;

    if (!isWatchingMode) {
      gameState.changed.add(() => {
        if (gameState.value != GameState.PLAYING) {
          this.disable();
        }
      });
    }
  }

  public enable() {
    this.enabled = true;
  }

  public disable() {
    this.enabled = false;
  }

  protected checkReject() {
    if (this.gameState.value == GameState.PLAYING
      && (!this.enabled
        || this.localUser.chess.value != this.gameRule.activeChessHost.value)) {
      this.onReject();
    }
  }

  public setPlayerView(playerView: Vue) {
    this.playerView = playerView;
  }

  public setGamepad(gamepad: Vue) {
    this.gamepad = gamepad;
  }
}
