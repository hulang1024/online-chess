import Playfield from "src/pages/play/Playfield";
import Bindable from "src/utils/bindables/Bindable";
import BindableBool from "src/utils/bindables/BindableBool";
import ChessHost from "./chess_host";
import ResponseGameStates from "./game_states_response";

export default abstract class GameRule {
  public onGameOver: (winChessHost: ChessHost) => void;

  public canWithdraw = new BindableBool();

  public viewChessHost: ChessHost;

  public activeChessHost = new Bindable<ChessHost | null>();

  public abstract setPlayfield(playfield: Playfield): void;

  public abstract start(viewChessHost: ChessHost, gameStates?: ResponseGameStates): void;

  public abstract withdraw(): void;

  public abstract reverseChessLayoutView(): void;
}
