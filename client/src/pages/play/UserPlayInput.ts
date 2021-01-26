import { socketService } from "src/boot/main";
import GameState from "src/online/play/GameState";
import ChessAction from "src/rule/ChessAction";
import ChessPos from "src/rule/ChessPos";
import ChessHost from "src/rule/chess_host";
import Bindable from "src/utils/bindables/Bindable";
import Signal from "src/utils/signals/Signal";
import DrawableChess from "./DrawableChess";
import DrawableChessboard from "./DrawableChessboard";
import GameRule from "./GameRule";

export default class UserPlayInput {
  public inputDone = new Signal();

  private gameRule: GameRule;

  private gameState: Bindable<GameState>;

  private chessboard: DrawableChessboard;

  private localChessHost: Bindable<ChessHost | null>;

  private lastSelected: DrawableChess | null;

  private socketService = socketService;

  constructor(
    gameRule: GameRule,
    gameState: Bindable<GameState>,
    localChessHost: Bindable<ChessHost | null>,
    activeChessHost: Bindable<ChessHost | null>,
  ) {
    this.gameRule = gameRule;
    this.gameState = gameState;
    this.localChessHost = localChessHost;
    this.chessboard = gameRule.getChessboard();

    this.chessboard.chessPickupOrDrop.add(this.onChessPickupOrDrop, this);
    this.chessboard.clicked.add(this.onChessboardClick, this);
    this.chessboard.chessMoved.add(this.onInputChessMove, this);

    gameState.changed.add(() => {
      this.lastSelected = null;

      if (gameState.value != GameState.PLAYING) {
        this.chessboard.enabled = false;
      }
    });
    activeChessHost.changed.add(() => {
      this.lastSelected = null;
    });
  }

  public onTurn() {
    const thisSide = this.gameRule.activeChessHost.value == this.localChessHost.value;
    // 如果当前是本方走，将敌方棋子禁用；否则，全部禁用
    this.chessboard.enabled = thisSide;
    if (thisSide) {
      this.chessboard.getChessList().forEach((chess) => {
        chess.enabled = this.localChessHost.value == chess.getHost();
      });
    }
  }

  private onChessPickupOrDrop({ chess, isPickup } : {chess: DrawableChess, isPickup: boolean}) {
    this.socketService.send('play.chess_pick', {
      pos: chess.getPos(),
      pickup: isPickup,
    });
  }

  private onChessboardClick(event: { chess: DrawableChess, pos: ChessPos }) {
    if (this.gameState.value != GameState.PLAYING) {
      return;
    }

    if (event.chess == null) {
      // 点击了空白处
      // 并且已经选择了一个棋子
      if (this.lastSelected != null) {
        // 往空白处移动
        const fromPos = this.lastSelected.getPos();
        const toPos = event.pos;
        const chess = this.chessboard.chessAt(fromPos);
        if (chess?.canGoTo(toPos, this.gameRule)) {
          this.onUserMoveChess(fromPos, toPos);
        }
      }
      return;
    }
    // 点击了一个棋子
    if (this.lastSelected == null) {
      // 并且之前并未选择棋子
      // 现在是选择要走的棋子，只能先选中持棋方棋子
      if (event.chess.getHost() == this.gameRule.activeChessHost.value) {
        this.lastSelected = event.chess;
        this.lastSelected.selected = true;
        this.onChessPickupOrDrop({ chess: event.chess, isPickup: true });
        // 将非持棋方的棋子全部启用（这样下次才能点击要吃的目标棋子）
        this.chessboard.getChessList().forEach((chess) => {
          if (chess.getHost() != this.localChessHost.value) {
            chess.enabled = true;
          }
        });
      }
      return;
    }

    if (event.chess.selected && event.chess.getHost() == this.localChessHost.value) {
      // 重复点击，取消选中
      this.lastSelected.selected = false;
      this.onChessPickupOrDrop({ chess: event.chess, isPickup: false });
      this.lastSelected = null;
      return;
    }

    // 当选择了两个棋子（包括了空棋子），并且两个棋子属于不同棋方，是吃子
    if (event.chess.getHost() != this.gameRule.activeChessHost.value) {
      const fromPos = this.lastSelected.getPos();
      const toPos = event.pos;
      const chess = this.chessboard.chessAt(fromPos);
      if (chess?.canGoTo(toPos, this.gameRule)) {
        this.onUserMoveChess(fromPos, toPos);
      }
    } else {
      // 选中了本方的，取消上个选中
      this.lastSelected.selected = false;
      event.chess.selected = true;
      this.lastSelected = event.chess;
      this.socketService.send('play.chess_pick', {
        pos: this.lastSelected?.getPos(),
        pickup: true,
      });
    }
  }

  private onInputChessMove({ chess, toPos }: {chess: DrawableChess, toPos: ChessPos}) {
    if (this.gameState.value != GameState.PLAYING) {
      return;
    }

    if (toPos.equals(chess.getPos())) {
      return;
    }
    if (chess.getHost() != this.localChessHost.value) {
      return;
    }
    if (this.lastSelected) {
      this.lastSelected.selected = false;
    }
    if (chess.canGoTo(toPos, this.gameRule)) {
      const isMove = this.chessboard.isEmpty(toPos.row, toPos.col);
      if (!isMove && this.chessboard.chessAt(toPos)?.getHost() == chess.getHost()) {
        return;
      }
      this.onUserMoveChess(chess.getPos(), toPos, 0);
    }
  }

  private onUserMoveChess(fromPos: ChessPos, toPos: ChessPos, duration?: number) {
    this.inputDone.dispatch();
    const action = new ChessAction();
    action.fromPos = fromPos;
    action.toPos = toPos;
    action.chessHost = this.localChessHost.value as ChessHost;
    this.gameRule.onChessAction(action, duration);
    this.socketService.send('play.chess_move', {
      fromPos,
      toPos,
    });
  }
}
