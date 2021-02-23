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
  private chessboard: GobangDrawableChessboard;

  private gameplayServer = new GobangGameplayServer();

  constructor(
    gameRule: GameRule,
    gameState: Bindable<GameState>,
    localChessHost: Bindable<ChessHost | null>,
  ) {
    super(gameRule, gameState, localChessHost);
    this.chessboard = (gameRule as GobangGameRule).getChessboard();

    this.chessboard.clicked.add(this.checkReject.bind(this));

    this.chessboard.onChessPosClick = this.onChessPosClick.bind(this);
  }

  public onChessPosClick(pos: ChessPos) {
    if (!this.enabled) {
      this.checkReject();
      return;
    }

    if (!(this.gameRule as GobangGameRule).chessboardState.isEmpty(pos)) {
      return;
    }

    const action = new ChessAction();
    action.pos = pos;
    action.chess = this.localChessHost.value as ChessHost;
    (this.gameRule as GobangGameRule).onChessAction(action);
    this.gameplayServer.putChess(action.pos, action.chess);
  }
}
