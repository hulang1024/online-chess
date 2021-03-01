import ChessAction from "src/rulesets/chinesechess/ChessAction";
import Chess from "./rule/Chess";
import ChessPos from "./rule/ChessPos";
import ChessHost from "../chess_host";
import CHESS_CLASS_KEY_MAP from "./rule/chess_map";
import { ResponseGameStateChessAction } from "./online/gameplay_server_messages";

export default class ReplayRecorder {
  private actions: ChessAction[] = [];

  public clear() {
    this.actions = [];
  }

  public push(action: ChessAction) {
    this.actions.push(action);
  }

  public pop() {
    return this.actions.pop();
  }

  public isEmpty() {
    return this.actions.length == 0;
  }

  public get(index: number) {
    index = index < 0 ? this.actions.length + index : index;
    return this.actions[index];
  }

  public fromResponse(actions: ResponseGameStateChessAction[], viewChessHost: ChessHost) {
    if (!(actions && actions.length)) {
      return;
    }

    const actionStack: ChessAction[] = actions.map((act) => {
      const action = new ChessAction();
      action.chessHost = act.chessHost == 'FIRST' ? ChessHost.FIRST : ChessHost.SECOND;
      // eslint-disable-next-line
      action.chessType = CHESS_CLASS_KEY_MAP[act.chessType];
      action.fromPos = ChessPos.make(act.fromPos);
      action.toPos = ChessPos.make(act.toPos);
      if (act.eatenChess) {
        // eslint-disable-next-line
        const chessClass = CHESS_CLASS_KEY_MAP[act.eatenChess.type];
        // eslint-disable-next-line
        const chess: Chess = new (chessClass as any)(
          ChessPos.make(act.toPos).convertViewPos(action.chessHost, viewChessHost),
          ChessHost[act.eatenChess.chessHost],
        );
        action.eatenChess = chess;
      }
      return action;
    });
    this.actions = actionStack;
  }
}
