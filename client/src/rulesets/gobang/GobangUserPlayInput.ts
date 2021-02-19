import GameState from "src/online/play/GameState";
import ChessPos from "src/rulesets/gobang/ChessPos";
import ChessHost from "src/rulesets/chess_host";
import Bindable from "src/utils/bindables/Bindable";
import UserPlayInput from "../UserPlayInput";
import GameRule from "../GameRule";
import GobangGameplayServer from "./online/GobangGameplayServer";
import GobangDrawableChessboard from "./ui/GobangDrawableChessboard";
import GobangGameRule from "./GobangGameRule";
import ChessAction from "./ChessAction";

export default class GobangUserPlayInput extends UserPlayInput {
  private enabled: boolean;

  private chessboard: GobangDrawableChessboard;

  private gameplayServer = new GobangGameplayServer();

  constructor(
    gameRule: GameRule,
    gameState: Bindable<GameState>,
    localChessHost: Bindable<ChessHost | null>,
  ) {
    super(gameRule, gameState, localChessHost);
    this.chessboard = (gameRule as GobangGameRule).getChessboard();

    this.chessboard.clicked.add(() => {
      if (this.gameState.value == GameState.PLAYING
        && this.localChessHost.value != this.gameRule.activeChessHost.value) {
        this.onReject();
      }
    });

    this.chessboard.onChessPosClick = this.onChessPosClick.bind(this);

    gameState.changed.add(() => {
      if (gameState.value != GameState.PLAYING) {
        this.disable();
      }
    });
  }

  public onChessPosClick(pos: ChessPos) {
    if (!this.enabled) {
      return;
    }

    if (!this.chessboard.chessboardState.isEmpty(pos)) {
      return;
    }

    const action = new ChessAction();
    action.pos = pos;
    action.chess = this.localChessHost.value as ChessHost;
    (this.gameRule as GobangGameRule).onChessAction(action);
    this.gameplayServer.putChess(action.pos, action.chess);
  }

  public enable() {
    this.enabled = true;
  }

  public disable() {
    this.enabled = false;
  }
}
