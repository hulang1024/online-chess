import ChessK from 'src/rulesets/chinesechess/chess/ChessK';
import ChessAction from 'src/rulesets/chinesechess/ChessAction';
import ChessPos from 'src/rulesets/chinesechess/ChessPos';
import ChessHost from 'src/rulesets/chinesechess/chess_host';
import CheckmateJudgement from 'src/rulesets/chinesechess/CheckmateJudgement';
import HistoryRecorder from 'src/rulesets/chinesechess/HistoryRecorder';
import Bindable from 'src/utils/bindables/Bindable';
import BindableBool from 'src/utils/bindables/BindableBool';
import Game from 'src/rulesets/chinesechess/Game';
import ResponseGameStates, { ResponseGameStateChess } from "src/online/play/game_states_response";
import CHESS_CLASS_KEY_MAP, { createIntialLayoutChessList } from 'src/rulesets/chinesechess/chess_map';
import Chess from 'src/rulesets/chinesechess/Chess';
import DrawableChess from "./DrawableChess";
import DrawableChessboard from "./DrawableChessboard";
import ChessMoveAnimation from './ChessMoveAnimation';
import ChessTargetDrawer from './ChessTargetDrawer';
import DrawableEatJudgement from './DrawableEatJudgement';
import DrawableCheckmateJudgement from './DrawableCheckmateJudgement';
import Playfield from './Playfield';

export default class GameRule implements Game {
  public onGameOver: (winChessHost: ChessHost) => void;

  public canWithdraw = new BindableBool();

  public activeChessHost = new Bindable<ChessHost | null>();

  public chessboard: DrawableChessboard;

  public viewChessHost: ChessHost;

  private historyRecorder = new HistoryRecorder();

  private checkmateJudgement: CheckmateJudgement;

  private fromPosTargetDrawer: ChessTargetDrawer;

  private drawableEatJudgement = new DrawableEatJudgement();

  private drawableCheckmateJudgement = new DrawableCheckmateJudgement();

  public getChessboard() {
    return this.chessboard;
  }

  public isHostAtChessboardTop(chessHost: ChessHost) {
    // 视角棋方总是在底部
    return chessHost != this.viewChessHost;
  }

  public setPlayfield(playfield: Playfield) {
    this.chessboard = playfield.chessboard;
    playfield.el.appendChild(this.drawableEatJudgement.el);
    playfield.el.appendChild(this.drawableCheckmateJudgement.el);
  }

  public start(viewChessHost: ChessHost, gameStates?: ResponseGameStates) {
    this.viewChessHost = viewChessHost;
    this.canWithdraw.value = false;

    if (!this.fromPosTargetDrawer) {
      this.fromPosTargetDrawer = new ChessTargetDrawer(this.chessboard);
    }
    this.fromPosTargetDrawer.clear();

    if (gameStates && gameStates.chesses) {
      // 把棋子放到棋盘上
      this.chessboard.clear();
      gameStates.chesses.forEach((stateChess: ResponseGameStateChess) => {
        let pos = new ChessPos(stateChess.row, stateChess.col);
        // 服务器保存数据默认视角是红方，如果当前视图是黑方就要翻转下
        if (this.viewChessHost == ChessHost.BLACK) {
          pos = pos.reverseView();
        }
        // eslint-disable-next-line
        let chess: Chess = new (CHESS_CLASS_KEY_MAP[stateChess.type] as any)(pos, stateChess.chessHost);
        this.chessboard.addChess(new DrawableChess(chess, this.chessboard.bounds.chessRadius));
      });
    } else {
      this.chessboard.clear();
      // 对面棋方棋子在上部
      const chessHost1 = ChessHost.reverse(this.viewChessHost);
      // 视角棋方棋子在下部
      const chessHost2 = this.viewChessHost;
      createIntialLayoutChessList(chessHost1, chessHost2).forEach((chess) => {
        this.chessboard.addChess(new DrawableChess(chess, this.chessboard.bounds.chessRadius));
      });
    }

    this.checkmateJudgement = new CheckmateJudgement(this, this.viewChessHost);

    this.chessboard.show();

    this.historyRecorder.clear();

    if (gameStates) {
      this.historyRecorder.fromResponse(gameStates.actionStack, this.viewChessHost);
      const lastAction = this.historyRecorder.get(-1);
      if (lastAction) {
        const { chessHost, fromPos, toPos } = lastAction;
        this.fromPosTargetDrawer.draw(fromPos.convertViewPos(chessHost, this.viewChessHost));
        const chess = this.chessboard.chessAt(toPos.convertViewPos(chessHost, this.viewChessHost));
        if (chess) {
          chess.setLit(true);
        }
      }
    }

    this.activeChessHost.value = (gameStates && gameStates.activeChessHost) || ChessHost.RED;
  }

  public onChessAction(action: ChessAction, duration?: number) {
    const { chessboard } = this;
    const { chessHost, fromPos, toPos } = action;

    chessboard.getChessList().forEach((chess: DrawableChess) => {
      if (chess.lit) {
        chess.setLit(false);
      }
    });

    const chess = chessboard.chessAt(
      fromPos.convertViewPos(chessHost, this.viewChessHost),
    ) as DrawableChess;
    const eatenChess = chessboard.chessAt(
      toPos.convertViewPos(chessHost, this.viewChessHost),
    ) as DrawableChess;

    if (eatenChess) {
      // 吃目标棋子
      action.eatenChess = eatenChess;
      this.chessboard.removeChess(eatenChess);
    }

    this.historyRecorder.push(action);

    // 被移动棋子选择状态置不选中
    chess.selectable = true;
    chess.selected = false;
    chess.selectable = false;
    const convertedToPos = toPos.convertViewPos(chessHost, this.viewChessHost);

    // 设置棋盘状态
    this.chessboard.getChessArray()[chess.getPos().row][chess.getPos().col] = null;
    this.chessboard.getChessArray()[convertedToPos.row][convertedToPos.col] = chess;
    chess.setPos(convertedToPos);

    ChessMoveAnimation.make(
      chess,
      this.chessboard.calcChessDisplayPos(convertedToPos),
      () => {
        this.fromPosTargetDrawer.draw(fromPos.convertViewPos(chessHost, this.viewChessHost));
      },
      duration,
    ).start();

    const judgementShowDelay = duration ? duration - 50 : duration;

    if (this.checkmateJudgement.judge(ChessHost.reverse(action.chessHost))) {
      setTimeout(() => {
        this.drawableCheckmateJudgement.show(action.chessHost);
      }, judgementShowDelay);
    } else if (eatenChess) {
      // 判断胜负
      if (eatenChess != null && eatenChess.is(ChessK)) {
        this.onGameOver(chess.getHost());
        return;
      }
      setTimeout(() => {
        this.drawableEatJudgement.show(eatenChess.chess);
      }, judgementShowDelay);
    }

    this.turnActiveChessHost();

    this.canWithdraw.value = true;
  }

  private turnActiveChessHost() {
    this.activeChessHost.value = ChessHost.reverse(this.activeChessHost.value as ChessHost);
  }

  public reverseChessLayoutView() {
    if (this.viewChessHost == null) {
      return;
    }
    // 保存下棋子引用
    const chesses: DrawableChess[] = [];
    this.chessboard.getChessList().forEach((chess) => {
      chesses.push(chess);
    });
    // 清空棋盘
    this.chessboard.clear();
    // 改变位置重新加上去
    chesses.forEach((chess) => {
      chess.setPos(ChessPos.reverseView(chess.getPos()));
      this.chessboard.addChess(chess);
    });

    // 改变位置重新画标记
    const fromPos = this.fromPosTargetDrawer.getSavePos();
    if (fromPos) {
      this.fromPosTargetDrawer.draw(ChessPos.reverseView(fromPos));
    }

    this.viewChessHost = ChessHost.reverse(this.viewChessHost);
  }

  /** 悔棋 */
  public withdraw() {
    const lastAction = this.historyRecorder.pop();
    if (!lastAction) {
      return;
    }

    this.chessboard.getChessList().forEach((chess: DrawableChess) => {
      if (chess.selected) {
        chess.selected = false;
      }
    });
    this.fromPosTargetDrawer.clear(true);

    // 视角可能变化了，需要转换下
    const fromPos = lastAction.fromPos.convertViewPos(lastAction.chessHost, this.viewChessHost);
    const toPos = lastAction.toPos.convertViewPos(lastAction.chessHost, this.viewChessHost);
    const chess = this.chessboard.chessAt(toPos) as DrawableChess;

    // 动画移到之前的开始位置
    chess.setLit(false);
    ChessMoveAnimation.make(
      chess,
      this.chessboard.calcChessDisplayPos(fromPos),
      () => {
        // 恢复之前的状态
        chess.setPos(fromPos);
        this.chessboard.getChessArray()[fromPos.row][fromPos.col] = chess;
        this.chessboard.getChessArray()[toPos.row][toPos.col] = null;

        // 如果吃了子，把被吃的子加回来
        if (lastAction.eatenChess) {
          let drawableChess: DrawableChess;
          if (lastAction.eatenChess instanceof DrawableChess) {
            drawableChess = lastAction.eatenChess;
          } else {
            drawableChess = new DrawableChess(
              lastAction.eatenChess,
              this.chessboard.bounds.chessRadius,
            );
          }
          this.chessboard.addChess(drawableChess);
        }

        // 画上手的棋子走位标记
        if (!this.historyRecorder.isEmpty()) {
          const prevAction = this.historyRecorder.get(-1);
          const convertedToPos = prevAction.toPos.convertViewPos(
            prevAction.chessHost, this.viewChessHost,
          );
          const convertedFromPos = prevAction.fromPos.convertViewPos(
            prevAction.chessHost, this.viewChessHost,
          );
          (this.chessboard.chessAt(convertedToPos) as DrawableChess).setLit(true);
          this.fromPosTargetDrawer.draw(convertedFromPos);
        }

        this.turnActiveChessHost();
      },
      200,
      false,
    ).start();

    this.canWithdraw.value = !this.historyRecorder.isEmpty();
  }
}
