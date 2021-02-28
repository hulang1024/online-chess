import Playfield from "src/pages/play/Playfield";
import Bindable from "src/utils/bindables/Bindable";
import BindableBool from "src/utils/bindables/BindableBool";
import ChessHost from "./chess_host";
import ResponseGameStates from "./game_states_response";

export default abstract class GameRule {
  public ended = false;

  public onGameOver: (winChessHost: ChessHost) => void;

  public onGameEnd: () => void;

  public canWithdraw = new BindableBool();

  public viewChessHost: ChessHost;

  public activeChessHost = new Bindable<ChessHost | null>();

  public abstract setPlayfield(playfield: Playfield): void;

  // eslint-disable-next-line
  public start(viewChessHost: ChessHost, gameStates?: ResponseGameStates) {
    this.ended = false;
  }

  public abstract withdraw(): void;

  public abstract reverseChessLayoutView(): void;

  protected gameEnd() {
    if (this.onGameEnd) {
      this.onGameEnd();
    }
    this.ended = true;
  }
}
