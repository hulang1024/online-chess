import { socketService } from "src/boot/main";
import ChessAction from "../ChessAction";
import ChessPos from "../rule/ChessPos";
import { ChessPickUpMsg, ChessMoveMsg } from "./gameplay_server_messages";
import DrawableChess from "../ui/DrawableChess";
import ChineseChessDrawableChessboard from "../ui/ChineseChessDrawableChessboard";
import RulesetClient from "../../online/RulesetClient";
import ChineseChessGameRule from "../ChineseChessGameRule";
import GameRule from "../../GameRule";

export default class ChineseChessClient extends RulesetClient {
  constructor(game: GameRule) {
    super(game);
    socketService.on('play.chinese_chess.chess_pick', this.chessPickup, this);
    socketService.on('play.chinese_chess.chess_move', this.chessMove, this);
  }

  public exit() {
    socketService.off('play.chinese_chess.chess_pick', this.chessPickup, this);
    socketService.off('play.chinese_chess.chess_move', this.chessMove, this);
  }

  private chessPickup(msg: ChessPickUpMsg): void {
    const chessboard = this.playfield.chessboard as ChineseChessDrawableChessboard;

    const selectableStates: boolean[] = [];

    chessboard.getChessList().forEach((chess: DrawableChess) => {
      if (chess.getHost() == msg.chessHost) {
        selectableStates.push(chess.selectable);
        chess.selectable = true;
        chess.selected = false;
      }
    });

    const pos = ChessPos.make(msg.pos).convertViewPos(msg.chessHost, this.game.viewChessHost);
    (chessboard.chessAt(pos) as DrawableChess).selected = msg.pickup;

    chessboard.getChessList().forEach((chess: DrawableChess, index) => {
      if (chess.getHost() == msg.chessHost) {
        chess.selectable = selectableStates[index];
      }
    });
  }

  private chessMove(msg: ChessMoveMsg): void {
    const action = new ChessAction();
    action.fromPos = ChessPos.make(msg.fromPos);
    action.toPos = ChessPos.make(msg.toPos);
    action.chessHost = msg.chessHost;
    (this.game as ChineseChessGameRule).onChessAction(action);
  }
}
