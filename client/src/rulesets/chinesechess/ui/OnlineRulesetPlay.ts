import ChessAction from "../ChessAction";
import ChessPos from "../ChessPos";
import ChinesechessClient from "../online/ChinesechessClient";
import { ChessPickUpMsg, ChessMoveMsg } from "../online/gameplay_server_messages";
import DrawableChess from "./DrawableChess";
import GameRule from "./GameRule";
import Playfield from "./Playfield";

export default class OnlineRulesetPlay extends ChinesechessClient {
  public gameRule: GameRule;

  public playfield: Playfield;

  protected chessPickup(msg: ChessPickUpMsg): void {
    const { chessboard } = this.playfield;

    const selectableStates: boolean[] = [];

    chessboard.getChessList().forEach((chess: DrawableChess) => {
      if (chess.getHost() == msg.chessHost) {
        selectableStates.push(chess.selectable);
        chess.selectable = true;
        chess.selected = false;
      }
    });

    const pos = ChessPos.make(msg.pos).convertViewPos(msg.chessHost, this.gameRule.viewChessHost);
    (chessboard.chessAt(pos) as DrawableChess).selected = msg.pickup;

    chessboard.getChessList().forEach((chess: DrawableChess, index) => {
      if (chess.getHost() == msg.chessHost) {
        chess.selectable = selectableStates[index];
      }
    });
  }

  protected chessMove(msg: ChessMoveMsg): void {
    const action = new ChessAction();
    action.fromPos = ChessPos.make(msg.fromPos);
    action.toPos = ChessPos.make(msg.toPos);
    action.chessHost = msg.chessHost;
    this.gameRule.onChessAction(action);
  }
}
