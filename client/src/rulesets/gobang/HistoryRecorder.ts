import ChessAction from "./ChessAction";
import ChessPos from "./ChessPos";
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

  public fromResponse(actions: ResponseGameStateChessAction[]) {
    if (!(actions && actions.length)) {
      return;
    }

    const actionStack: ChessAction[] = actions.map((act) => {
      const action = new ChessAction();
      // eslint-disable-next-line
      action.chess = act.chess;
      action.pos = ChessPos.make(act.pos);
      return action;
    });
    this.actions = actionStack;
  }
}
