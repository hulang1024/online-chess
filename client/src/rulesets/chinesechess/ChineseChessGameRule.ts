import { configManager } from 'src/boot/main';
import { ConfigItem } from 'src/config/ConfigManager';
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
import ChessStatusDisplay from './ChessStatusDisplay';
import GameAudio from '../GameAudio';
import ChessboardState from './rule/ChessboardState';
import OutsideChessPanel, { OutsideChessPanelType } from './ui/OutsideChessPanel';

export default class ChineseChessGameRule extends GameRule implements Game {
  public chessboard: ChineseChessDrawableChessboard;

  public chessboardState: ChessboardState;

  public checkmateJudgement: CheckmateJudgement;

  public chessStatusDisplay: ChessStatusDisplay;

  public drawableCheckmateJudgement = new DrawableCheckmateJudgement();

  private historyRecorder = new HistoryRecorder();

  private fromPosTargetDrawer: ChessTargetDrawer;

  private drawableEatJudgement = new DrawableEatJudgement();

  protected enableOutsideChessPanel = false;

  private localOutsideChessPanel: OutsideChessPanel;

  private otherOutsideChessPanel: OutsideChessPanel;

  public isHostAtChessboardTop(chessHost: ChessHost) {
    // 视角棋方总是在底部
    return chessHost != this.viewChessHost;
  }

  public setPlayfield(playfield: Playfield) {
    this.chessboard = playfield.chessboard as ChineseChessDrawableChessboard;
    this.chessboardState = this.chessboard.chessboardState;
    this.chessStatusDisplay = new ChessStatusDisplay(this);
    playfield.resized.add(() => {
      if (this.fromPosTargetDrawer?.getSavePos()) {
        this.fromPosTargetDrawer.draw(this.fromPosTargetDrawer.getSavePos());
      }
      if (configManager.get(ConfigItem.chinesechessChessStatus)) {
        this.chessStatusDisplay.clear();
      }
    });
    playfield.el.appendChild(this.drawableEatJudgement.el);
    playfield.el.appendChild(this.drawableCheckmateJudgement.el);

    if (this.enableOutsideChessPanel) {
      const { screen } = playfield.context.$q;
      this.localOutsideChessPanel = new OutsideChessPanel(
        OutsideChessPanelType.local, this.chessboard.bounds, screen,
      );
      playfield.el.appendChild(this.localOutsideChessPanel.el);
      this.otherOutsideChessPanel = new OutsideChessPanel(
        OutsideChessPanelType.other, this.chessboard.bounds, screen,
      );
      playfield.el.insertBefore(this.otherOutsideChessPanel.el, this.chessboard.el);
    }
  }

  public start(viewChessHost: ChessHost, gameStates0?: ResponseGameStates) {
    super.start(viewChessHost, gameStates0);
    this.viewChessHost = viewChessHost;
    this.chessboard.hanNumberInBottom = this.viewChessHost == ChessHost.FIRST;
    this.chessboard.redraw();
    this.withdrawEnabled.value = false;

    if (!this.fromPosTargetDrawer) {
      this.fromPosTargetDrawer = new ChessTargetDrawer(this.chessboard);
    }
    if (this.enableOutsideChessPanel) {
      this.localOutsideChessPanel.reset();
      this.otherOutsideChessPanel.reset();
    }
    this.chessStatusDisplay.clear();
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
      if (configManager.get(ConfigItem.chinesechessChessStatus)) {
        // eslint-disable-next-line
        this.chessStatusDisplay.update(this.viewChessHost);
      }
    } else {
      this.chessboard.clear();
      this.initChessLayout();
    }

    this.checkmateJudgement = new CheckmateJudgement(this);

    this.chessboard.show();

    this.historyRecorder.clear();

    if (gameStates) {
      this.historyRecorder.fromResponse(gameStates.actionStack, this.viewChessHost);
      this.withdrawEnabled.value = !this.historyRecorder.isEmpty();
      const lastAction = this.historyRecorder.get(-1);
      if (lastAction) {
        const { chessHost, fromPos, toPos } = lastAction;
        this.fromPosTargetDrawer.draw(fromPos.convertViewPos(chessHost, this.viewChessHost));
        const chess = this.chessboard.chessAt(toPos.convertViewPos(chessHost, this.viewChessHost));
        if (chess) {
          chess.setLit(true);
        }
      }
      if (this.enableOutsideChessPanel) {
        this.initOutsideChessPanel();
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

  private initOutsideChessPanel() {
    // const chessboardState = this.chessboardState.clone();
    const stack: Chess[] = [];
    for (let top = this.historyRecorder.length() - 1; top >= 0; top--) {
      const action = this.historyRecorder.get(top);
      if (action.eatenChess) {
        stack.push(action.eatenChess);
      }
    }

    while (true) {
      const chess = stack.pop();
      if (chess) {
        if (chess.getHost() == this.viewChessHost) {
          this.otherOutsideChessPanel.addChess(chess);
        } else {
          this.localOutsideChessPanel.addChess(chess);
        }
      } else {
        break;
      }
    }
  }

  public onChessAction(action: ChessAction, instant = false) {
    const { chessboard } = this;
    const { chessHost, fromPos, toPos } = action;

    chessboard.getChesses().forEach((chess: DrawableChess) => {
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
      this.chessboardState.removeChess(eatenChess.getPos());
    }

    this.historyRecorder.push(action);

    // 被移动棋子选择状态置不选中
    chess.selectable = true;
    chess.selected = false;
    chess.selectable = false;

    const convertedToPos = toPos.convertViewPos(chessHost, this.viewChessHost);
    // 设置棋盘状态
    this.chessboardState.setChess(chess.getPos(), null);
    this.chessboardState.setChess(convertedToPos, chess.chess);
    chess.setPos(convertedToPos);

    const otherChessHost = ChessHost.reverse(action.chessHost);
    const isCheckmate = this.checkmateJudgement.judge(
      otherChessHost, this.chessboardState, chess.chess,
    );
    const judge = () => {
      if (!isCheckmate && eatenChess) {
        if (configManager.get(ConfigItem.chinesechessGameplayAudioEnabled)) {
          GameAudio.play('games/chinesechess/default/eat');
        }
      }

      let isDie = false;
      if (isCheckmate) {
        isDie = this.checkmateJudgement.judgeDie(otherChessHost, this.chessboardState);
        this.drawableCheckmateJudgement.show(action.chessHost, isDie);
      } else if (eatenChess) {
        // 判断胜负
        if (eatenChess != null && eatenChess.is(ChessK)) {
          isDie = true;
        } else {
          this.drawableEatJudgement.show(eatenChess.chess);
        }
      }
      if (isDie) {
        this.onGameOver(chess.getHost());
        setTimeout(() => {
          this.chessStatusDisplay.clear();
          this.gameEnd();
        }, 1500);
        return;
      }

      if (configManager.get(ConfigItem.chinesechessChessStatus)) {
        // eslint-disable-next-line
        this.chessStatusDisplay.update(this.viewChessHost);
      }
    };

    ChessMoveAnimation.make(
      chess,
      convertedToPos,
      this.chessboard.calcChessDisplayPos(convertedToPos),
      {
        moveEnd: () => {
          judge();
        },
        dropStart: () => {
          if (eatenChess) {
            this.chessboard.removeChess(eatenChess);
            if (this.enableOutsideChessPanel) {
              if (eatenChess.getHost() == this.viewChessHost) {
                this.otherOutsideChessPanel.addChess(eatenChess.chess);
              } else {
                this.localOutsideChessPanel.addChess(eatenChess.chess);
              }
            }
          }
        },
        dropEnd: () => {
          this.fromPosTargetDrawer.draw(fromPos.convertViewPos(chessHost, this.viewChessHost));
          chess.setLit(true);
        },
      },
      instant,
      !eatenChess && !isCheckmate,
    ).start();

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

    this.chessboard.hanNumberInBottom = this.viewChessHost == ChessHost.FIRST;
    this.chessboard.redraw();

    // 保存下棋子引用
    const chesses: DrawableChess[] = [];
    this.chessboard.getChesses().forEach((chess) => {
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
    if (configManager.get(ConfigItem.chinesechessChessStatus)) {
      // eslint-disable-next-line
      this.chessStatusDisplay.update(this.viewChessHost);
    }

    if (this.enableOutsideChessPanel) {
      const otherChessPlaces = this.otherOutsideChessPanel.chessPlaces;
      const localChessPlaces = this.localOutsideChessPanel.chessPlaces;
      this.otherOutsideChessPanel.reset();
      this.localOutsideChessPanel.reset();
      this.otherOutsideChessPanel.reloadChessPlaces(localChessPlaces);
      this.localOutsideChessPanel.reloadChessPlaces(otherChessPlaces);
    }
  }

  /** 悔棋 */
  public withdraw() {
    const lastAction = this.historyRecorder.pop();
    if (!lastAction) {
      return;
    }

    this.chessboard.getChesses().forEach((chess: DrawableChess) => {
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
      fromPos,
      this.chessboard.calcChessDisplayPos(fromPos),
      {
        dropEnd: () => {
          // 恢复之前的状态
          chess.setPos(fromPos);
          this.chessboardState.setChess(fromPos, chess.chess);
          this.chessboardState.setChess(toPos, null);

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
            if (this.enableOutsideChessPanel) {
              if (drawableChess.getHost() == this.viewChessHost) {
                this.otherOutsideChessPanel.removeChess(drawableChess.chess);
              } else {
                this.localOutsideChessPanel.removeChess(drawableChess.chess);
              }
            }
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
          if (configManager.get(ConfigItem.chinesechessChessStatus)) {
            // eslint-disable-next-line
            this.chessStatusDisplay.update(this.viewChessHost);
          }
          this.turnActiveChessHost();
        },
      },
      false,
      false,
    ).start();

    this.withdrawEnabled.value = !this.historyRecorder.isEmpty();
  }

  public canGoTo(chess: Chess | null, destPos: ChessPos): boolean {
    return chess?.canGoTo(destPos, this.chessboardState, this) as boolean;
  }
}
