import GameState from "src/online/play/GameState";
import ChessAction from "src/rulesets/chinesechess/ChessAction";
import ChessPos from "src/rulesets/chinesechess/ChessPos";
import Bindable from "src/utils/bindables/Bindable";
import GameUser from "src/online/play/GameUser";
import ChinesechessGameplayServer from "./online/ChinesechessGameplayServer";
import DrawableChess from "./ui/DrawableChess";
import DrawableChessboard from "./ui/ChineseChessDrawableChessboard";
import UserPlayInput from "../UserPlayInput";
import ChineseChessGameRule from "./ChineseChessGameRule";
import GameRule from "../GameRule";

export default class ChineseChessUserPlayInput extends UserPlayInput {
  private chessboard: DrawableChessboard;

  private lastSelected: DrawableChess | null;

  private gameplayServer = new ChinesechessGameplayServer();

  constructor(
    gameRule: GameRule,
    gameState: Bindable<GameState>,
    localUser: GameUser,
    isWatchingMode: boolean,
  ) {
    super(gameRule, gameState, localUser, isWatchingMode);

    if (isWatchingMode) {
      return;
    }

    this.chessboard = (gameRule as ChineseChessGameRule).getChessboard();

    this.chessboard.clicked.add(this.checkReject.bind(this));

    this.chessboard.chessPickupOrDrop.add(({ chess, isPickup }
      : {chess: DrawableChess, isPickup: boolean}) => {
      this.gameplayServer.pickChess(chess.getPos(), isPickup);
    }, this);
    this.chessboard.chessPosClicked.add(this.onChessboardClick, this);
    this.chessboard.chessMoved.add(this.onInputChessMove, this);

    gameState.changed.add(() => {
      this.lastSelected = null;
    });
    this.gameRule.activeChessHost.changed.add(() => {
      this.lastSelected = null;
    });
  }

  public enable() {
    super.enable();
    this.chessboard.getChessList().forEach((chess) => {
      chess.selectable = this.localUser.chess.value == chess.getHost();
    });
  }

  public disable() {
    super.disable();
    this.chessboard.getChessList().forEach((chess) => {
      chess.selectable = false;
    });
  }

  private onChessboardClick(event: { chess: DrawableChess, pos: ChessPos }) {
    if (!this.enabled) {
      this.checkReject();
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
        if (chess?.canGoTo(toPos, (this.gameRule as ChineseChessGameRule))) {
          this.onUserMoveChess(fromPos, toPos);
        }
      }
      return;
    }
    // 点击了一个棋子
    if (this.lastSelected == null) {
      if (!event.chess.selectable) {
        return;
      }
      // 并且之前并未选择棋子
      // 现在是选择要走的棋子，只能先选中持棋方棋子
      if (event.chess.getHost() == this.gameRule.activeChessHost.value) {
        this.lastSelected = event.chess;
        this.lastSelected.selected = true;
        this.gameplayServer.pickChess(event.chess.getPos(), true);
        // 将非持棋方的棋子全部启用（这样下次才能点击要吃的目标棋子）
        this.chessboard.getChessList().forEach((chess) => {
          if (chess.getHost() != this.localUser.chess.value) {
            chess.selectable = true;
          }
        });
      }
      return;
    }

    if (event.chess.selected && event.chess.getHost() == this.localUser.chess.value) {
      // 重复点击，取消选中
      this.lastSelected.selected = false;
      this.gameplayServer.pickChess(event.chess.getPos(), false);
      this.lastSelected = null;
      this.chessboard.getChessList().forEach((chess) => {
        if (chess.getHost() != this.localUser.chess.value) {
          chess.selectable = false;
        }
      });
      return;
    }

    // 当选择了两个棋子（包括了空棋子），并且两个棋子属于不同棋方，是吃子
    if (event.chess.getHost() != this.gameRule.activeChessHost.value) {
      const fromPos = this.lastSelected.getPos();
      const toPos = event.pos;
      const chess = this.chessboard.chessAt(fromPos);
      if (chess?.canGoTo(toPos, this.gameRule as ChineseChessGameRule)) {
        this.onUserMoveChess(fromPos, toPos);
      }
    } else {
      // 选中了本方的，取消上个选中
      this.lastSelected.selected = false;
      event.chess.selected = true;
      this.lastSelected = event.chess;
      this.gameplayServer.pickChess(this.lastSelected?.getPos(), true);
    }
  }

  private onInputChessMove({ chess, toPos }: {chess: DrawableChess, toPos: ChessPos}) {
    if (this.gameState.value != GameState.PLAYING) {
      return;
    }

    if (toPos.equals(chess.getPos())) {
      return;
    }
    if (chess.getHost() != this.localUser.chess.value) {
      return;
    }
    if (this.lastSelected) {
      this.lastSelected.selected = false;
    }
    if (chess.canGoTo(toPos, this.gameRule as ChineseChessGameRule)) {
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
    action.chessHost = this.localUser.chess.value;
    (this.gameRule as ChineseChessGameRule).onChessAction(action, duration);
    this.gameplayServer.moveChess(fromPos, toPos);
  }
}
