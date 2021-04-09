import GameState from "src/online/play/GameState";
import ChessAction from "src/rulesets/chinesechess/ChessAction";
import ChessPos from "src/rulesets/chinesechess/rule/ChessPos";
import Bindable from "src/utils/bindables/Bindable";
import GameUser from "src/online/play/GameUser";
import ChineseChessGameplayServer from "./online/ChineseChessGameplayServer";
import DrawableChess from "./ui/DrawableChess";
import DrawableChessboard from "./ui/ChineseChessDrawableChessboard";
import UserPlayInput from "../UserPlayInput";
import ChineseChessGameRule from "./ChineseChessGameRule";
import GameRule from "../GameRule";
import GoDisplay from "./GoDisplay";
import ChessHost from "../chess_host";

export default class ChineseChessUserPlayInput extends UserPlayInput {
  private chessboard: DrawableChessboard;

  protected gameRule: ChineseChessGameRule;

  public goDisplay: GoDisplay;

  public lastSelected: DrawableChess | null;

  private gameplayServer = new ChineseChessGameplayServer();

  constructor(
    gameRule: GameRule,
    gameState: Bindable<GameState>,
    localUser: GameUser,
    isWatchingMode: boolean,
  ) {
    super(gameRule, gameState, localUser, isWatchingMode);

    this.chessboard = this.gameRule.chessboard;
    this.chessboard.clicked.add(this.checkReject.bind(this));

    this.chessboard.chessPickupOrDrop.add(({ chess, isPickup }
      : {chess: DrawableChess, isPickup: boolean}) => {
      if (isPickup && !this.enabled) {
        this.checkReject();
        return;
      }
      this.gameplayServer.pickChess(chess.getPos(), isPickup);
    }, this);
    this.chessboard.chessPosClicked.add(this.onChessboardClick, this);
    this.chessboard.chessMoved.add(this.onInputChessMove, this);

    if (isWatchingMode) {
      return;
    }

    this.goDisplay = new GoDisplay(this.gameRule);

    gameState.changed.add((newGameState: GameState) => {
      switch (newGameState) {
        case GameState.READY:
        case GameState.END:
          this.lastSelected = null;
          break;
        case GameState.PAUSE:
          this.goDisplay.clear();
          break;
        case GameState.PLAYING:
          if (this.lastSelected) {
            this.goDisplay.update(this.lastSelected);
          } else {
            this.goDisplay.clear();
          }
          break;
        default:
          break;
      }
    });
    this.gameRule.activeChessHost.changed.add(() => {
      this.lastSelected = null;
    });
  }

  public enable() {
    super.enable();
    this.chessboard.getChesses().forEach((chess) => {
      chess.selectable = this.localUser.chess.value == chess.getHost();
    });
  }

  public disable() {
    super.disable();
    this.chessboard.getChesses().forEach((chess) => {
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
        if (this.canGoTo(chess, toPos)) {
          this.onUserMoveChess(fromPos, toPos);
          this.goDisplay.clear();
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
        this.goDisplay.update(event.chess);
      }
      return;
    }

    if (event.chess.selected && event.chess.getHost() == this.localUser.chess.value) {
      // 重复点击，取消选中
      this.lastSelected.selected = false;
      this.gameplayServer.pickChess(event.chess.getPos(), false);
      this.lastSelected = null;
      this.chessboard.getChesses().forEach((chess) => {
        if (chess.getHost() != this.localUser.chess.value) {
          chess.selectable = false;
        }
      });
      this.goDisplay.clear();
      return;
    }

    // 当选择了两个棋子（包括了空棋子），并且两个棋子属于不同棋方，是吃子
    if (event.chess.getHost() != this.gameRule.activeChessHost.value) {
      const fromPos = this.lastSelected.getPos();
      const toPos = event.pos;
      const chess = this.chessboard.chessAt(fromPos);
      if (this.canGoTo(chess, toPos)) {
        this.onUserMoveChess(fromPos, toPos);
        this.goDisplay.clear();
      }
    } else {
      // 选中了本方的，取消上个选中
      this.lastSelected.selected = false;
      event.chess.selected = true;
      this.lastSelected = event.chess;
      this.gameplayServer.pickChess(this.lastSelected?.getPos(), true);
      this.goDisplay.update(event.chess);
    }
  }

  private onInputChessMove({ chess, toPos }: {chess: DrawableChess, toPos: ChessPos}) {
    if (!this.enabled) {
      this.checkReject();
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
    if (this.canGoTo(chess, toPos)) {
      const isMove = this.gameRule.chessboardState.isEmpty(toPos.row, toPos.col);
      if (!isMove && this.gameRule.chessboardState.chessAt(toPos)?.getHost() == chess.getHost()) {
        return;
      }
      this.onUserMoveChess(chess.getPos(), toPos, true);
    }
  }

  private onUserMoveChess(fromPos: ChessPos, toPos: ChessPos, instant = false) {
    this.inputDone.dispatch();
    const action = new ChessAction();
    action.fromPos = fromPos;
    action.toPos = toPos;
    action.chessHost = this.localUser.chess.value;
    this.gameRule.onChessAction(action, instant);
    this.gameplayServer.moveChess(fromPos, toPos);
  }

  private canGoTo(chess: DrawableChess | null, destPos: ChessPos) {
    const might = this.gameRule.canGoTo(chess, destPos);
    if (might && chess) {
      const alreadyCheckmate = this.gameRule.checkmateJudgement.judge(
        chess.getHost(), this.gameRule.chessboardState,
      );
      const nextChessboardState = this.gameRule.chessboardState.chessMovedClone(chess, destPos);
      if (this.gameRule.checkmateJudgement.judge(chess.getHost(), nextChessboardState)) {
        if (alreadyCheckmate) {
          this.gameRule.drawableCheckmateJudgement.show(ChessHost.reverse(chess.getHost()));
        } else {
          this.player.showText('不能送将', 1000);
        }
        return false;
      }
    }
    return might;
  }
}
