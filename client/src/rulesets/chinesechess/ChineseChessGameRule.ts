import ChessK from 'src/rulesets/chinesechess/rule/ChessK';
import ChessAction from 'src/rulesets/chinesechess/ChessAction';
import ChessPos from 'src/rulesets/chinesechess/rule/ChessPos';
import ChessHost from 'src/rulesets/chess_host';
import CheckmateJudgement from 'src/rulesets/chinesechess/rule/CheckmateJudgement';
import HistoryRecorder from 'src/rulesets/chinesechess/HistoryRecorder';
import Game from 'src/rulesets/chinesechess/rule/Game';
import CHESS_CLASS_KEY_MAP, { createIntialLayoutChessList } from 'src/rulesets/chinesechess/rule/chess_map';
import Chess from 'src/rulesets/chinesechess/rule/Chess';
import ResponseGameStates from 'src/rulesets/online/game_states_response';
import GameRule from 'src/rulesets/GameRule';
import DrawableChess from "./ui/DrawableChess";
import ChessMoveAnimation from './ui/ChessMoveAnimation';
import ChessTargetDrawer from './ui/ChessTargetDrawer';
import DrawableEatJudgement from './ui/DrawableEatJudgement';
import DrawableCheckmateJudgement from './ui/DrawableCheckmateJudgement';
import Playfield from '../../pages/play/Playfield';
import ChineseChessResponseGameStates, { ResponseGameStateChess } from './online/gameplay_server_messages';
import ChineseChessDrawableChessboard from './ui/ChineseChessDrawableChessboard';

export default class ChineseChessGameRule extends GameRule implements Game {
  public chessboard: ChineseChessDrawableChessboard;

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
    this.chessboard = playfield.chessboard as ChineseChessDrawableChessboard;
    playfield.resized.add(() => {
      if (this.fromPosTargetDrawer?.getSavePos()) {
        this.fromPosTargetDrawer.draw(this.fromPosTargetDrawer.getSavePos());
      }
    });
    playfield.el.appendChild(this.drawableEatJudgement.el);
    playfield.el.appendChild(this.drawableCheckmateJudgement.el);
  }

  public start(viewChessHost: ChessHost, gameStates0?: ResponseGameStates) {
    super.start(viewChessHost, gameStates0);
    this.viewChessHost = viewChessHost;
    this.withdrawEnabled.value = false;

    if (!this.fromPosTargetDrawer) {
      this.fromPosTargetDrawer = new ChessTargetDrawer(this.chessboard);
    }
    this.fromPosTargetDrawer.clear();

    const gameStates = gameStates0 as ChineseChessResponseGameStates;
    if (gameStates && gameStates.chesses) {
      // 把棋子放到棋盘上
      this.chessboard.clear();
      gameStates.chesses.forEach((stateChess: ResponseGameStateChess) => {
        let pos = new ChessPos(stateChess.row, stateChess.col);
        // 服务器保存数据默认视角是红方，如果当前视图是黑方位置就要反转下
        if (this.viewChessHost == ChessHost.SECOND) {
          pos = pos.reverseView();
        }
        // eslint-disable-next-line
        let chess: Chess = new (CHESS_CLASS_KEY_MAP[stateChess.type] as any)(pos, stateChess.chessHost);
        chess.setFront(stateChess.isFront);
        this.chessboard.addChess(new DrawableChess(chess, this.chessboard.bounds.chessRadius));
      });
    } else {
      this.chessboard.clear();
      this.initChessLayout();
    }

    this.checkmateJudgement = new CheckmateJudgement(this);

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

    this.activeChessHost.value = (gameStates && gameStates.activeChessHost) || ChessHost.FIRST;
  }

  protected initChessLayout() {
    // 对面棋方棋子在上部
    const chessHost1 = ChessHost.reverse(this.viewChessHost);
    // 视角棋方棋子在下部
    const chessHost2 = this.viewChessHost;
    createIntialLayoutChessList(chessHost1, chessHost2).forEach((chess) => {
      this.chessboard.addChess(new DrawableChess(chess, this.chessboard.bounds.chessRadius));
    });
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
        // todo: 模块化揭棋代码
        if (!chess.isFront()) {
          chess.setFront(true);
        }
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
        setTimeout(() => {
          this.gameEnd();
        }, 500);
        return;
      }
      setTimeout(() => {
        this.drawableEatJudgement.show(eatenChess.chess);
      }, judgementShowDelay);
    }

    this.turnActiveChessHost();

    this.withdrawEnabled.value = true;
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

    this.withdrawEnabled.value = !this.historyRecorder.isEmpty();
  }

  public canGoTo(chess: DrawableChess | null, destPos: ChessPos) {
    return chess?.canGoTo(destPos, this);
  }
}
