import { onBeforeUnmount } from "@vue/composition-api";
import ResponseGameStates, { ResponseGameStateChess, ResponseGameStateChessAction } from "src/online/play/game_states_response";
import Checkmate from "src/rule/Checkmate";
import Chess from "src/rule/Chess";
import ChessK from "src/rule/chess/ChessK";
import ChessAction from "src/rule/ChessAction";
import ChessPos from "src/rule/ChessPos";
import ChessHost from "src/rule/chess_host";
import CHESS_CLASS_KEY_MAP, { createIntialLayoutChessList, chessClassToText } from "src/rule/chess_map";
import Game from "src/rule/Game";
import Bindable from "src/utils/bindables/Bindable";
import Signal from "src/utils/signals/Signal";
import TWEEN from "tween.ts";
import ChessTargetDrawer from "./ChessTargetDrawer";
import DrawableChess from "./DrawableChess";
import DrawableChessboard from "./DrawableChessboard";
import GameAudio from "./GameAudio";

export default class Player implements Game {
  public loaded: Signal = new Signal();

  public chessboard: DrawableChessboard;

  public gameOver: Signal = new Signal();

  public activeChessHost: Bindable<ChessHost> = new Bindable<ChessHost>();

  public screen: any;

  private viewChessHost: ChessHost;

  private lastViewChessHost: ChessHost;

  private checkmate: Checkmate;

  private chessActionStack: Array<ChessAction>;

  private fromPosTargetDrawer: ChessTargetDrawer;

  private animationId: number;

  private textOverlay: any;

  constructor(context: Vue) {
    onBeforeUnmount(() => {
      cancelAnimationFrame(this.animationId);
    });

    this.textOverlay = context.$refs.textOverlay;

    this.startTween();
  }

  public getChessboard() {
    return this.chessboard;
  }

  public isHostAtChessboardTop(chessHost: ChessHost) {
    // 视角棋方总是在底部
    return chessHost != this.viewChessHost;
  }

  public startGame(viewChessHost: ChessHost, gameStates?: ResponseGameStates) {
    this.lastViewChessHost = this.viewChessHost;
    this.viewChessHost = viewChessHost;
    if (this.lastViewChessHost == null) {
      this.lastViewChessHost = viewChessHost;
    }

    if (!this.fromPosTargetDrawer) {
      this.fromPosTargetDrawer = new ChessTargetDrawer(this.chessboard);
    }
    this.fromPosTargetDrawer.clear();

    if (gameStates && gameStates.chesses) {
      // 把棋子放到棋盘上
      this.clearChessboard();
      gameStates.chesses.forEach((stateChess: ResponseGameStateChess) => {
        let pos = new ChessPos(stateChess.row, stateChess.col);
        // 服务器保存数据默认视角是红方，如果当前视图是黑方就要翻转下
        if (this.viewChessHost == ChessHost.BLACK) {
          pos = pos.reverseView();
        }
        /* eslint-disable */
        let chess: Chess = new (CHESS_CLASS_KEY_MAP[stateChess.type] as any)(pos, stateChess.chessHost);
        this.chessboard.addChess(this.createDrawableChess(chess));
      });
    } else {
      this.initChessLayout();
    }

    this.checkmate = new Checkmate(this, this.viewChessHost);

    this.chessboard.enabled = false;
    this.chessboard.getChessList().forEach(chess => {
      chess.enabled = false;
    });

    this.chessActionStack = [];

    if (gameStates) {
      this.loadActionStackState(gameStates);
    }

    this.activeChessHost.value = (gameStates && gameStates.activeChessHost) || ChessHost.RED;
  }

  public pickChess(picked: boolean, pos: ChessPos, chessHost: ChessHost) {    
    this.chessboard.getChessList().forEach((chess: DrawableChess) => {
      if (chess.selected && chess.getHost() == chessHost) {
        chess.selected = false;
      }
    });
    
    pos = this.convertViewPos(pos, chessHost);
    let chess = this.chessboard.chessAt(pos) as DrawableChess;
    chess.selected = picked;
  }

  private loadActionStackState(states: ResponseGameStates) {
    if (!(states.actionStack && states.actionStack.length)) {
      return;
    }
    let actionStack: Array<ChessAction> = states.actionStack.map((act: ResponseGameStateChessAction) => {
      let action = new ChessAction();
      action.chessHost = act.chessHost == 'RED' ? ChessHost.RED : ChessHost.BLACK;
      action.chessType = CHESS_CLASS_KEY_MAP[act.chessType];
      action.fromPos = ChessPos.make(act.fromPos);
      action.toPos = ChessPos.make(act.toPos);
      if (act.eatenChess) {
        let chessClass = CHESS_CLASS_KEY_MAP[act.eatenChess.type];
        let chess = new (chessClass as any)(
          this.convertViewPos(ChessPos.make(act.toPos), action.chessHost),
          ChessHost[act.eatenChess.chessHost]);
        action.eatenChess = chess;
      }
      return action;
    });
    this.chessActionStack = actionStack;

    let lastAction = actionStack[actionStack.length - 1];
    let { chessHost, fromPos, toPos } = lastAction;
    this.fromPosTargetDrawer.draw(this.convertViewPos(fromPos, chessHost));
    let chess = this.chessboard.chessAt(this.convertViewPos(toPos, chessHost));
    if (chess) {
      chess.setLit(true);
    }
  }

  public moveChess(fromPos: ChessPos, toPos: ChessPos, chessHost: ChessHost, isEat: boolean) {
    this.chessboard.getChessList().forEach((chess: DrawableChess) => {
      if (chess.lit) {
        chess.setLit(false);
      }
    });

    // 被移动棋子
    let chess = this.chessboard.chessAt(this.convertViewPos(fromPos, chessHost)) as DrawableChess;
    let targetChess: DrawableChess;

    // 记录动作
    let action = new ChessAction();
    action.chessHost = chessHost;
    action.chessType = chess.constructor;
    action.fromPos = fromPos;
    action.toPos = toPos;
    if (isEat) {
      // 吃目标棋子
      targetChess = this.chessboard.chessAt(this.convertViewPos(toPos, chessHost)) as DrawableChess;
      action.eatenChess = targetChess;
      this.chessboard.removeChess(targetChess);
    }
    this.chessActionStack.push(action);

    // 被移动棋子选择状态置不选中
    chess.selected = false;
    toPos = this.convertViewPos(toPos, chessHost);
    // 移动棋子动画
    const {x, y} = this.chessboard.calcChessDisplayPos(toPos);
    new TWEEN.Tween(chess)
      .to({x, y}, 200)
      .easing(TWEEN.Easing.Circular.Out)
      .onComplete(() => {
        // 高亮被移动棋子
        chess.setLit(true);
        // 画移动源位置标记
        this.fromPosTargetDrawer.draw(this.convertViewPos(fromPos, chessHost));
        // 音效
        GameAudio.play('click');

        // 设置棋盘状态
        this.chessboard.getChessArray()[chess.getPos().row][chess.getPos().col] = null;
        this.chessboard.getChessArray()[toPos.row][toPos.col] = chess;
        chess.setPos(toPos);
    
        if (isEat) {
          // 判断胜负
          if (targetChess != null && targetChess.is(ChessK)) {
            this.gameOver.dispatch(chess.getHost());
          } else {
            this.showText(`吃!（${targetChess.getHost() == ChessHost.RED ? '红方' : '黑方'}的${chessClassToText(targetChess.chess)}被吃）`, 1500);
            this.checkCheckmate();
            this.turnActiveChessHost();
          }
        } else {
          this.checkCheckmate();
          this.turnActiveChessHost();
        }
      })
      .start();
  }

  /** 悔棋 */
  public withdraw(): boolean {       
    let lastAction = this.chessActionStack.pop() as ChessAction;
    if (!lastAction) {
      return false;
    }
    
    this.chessboard.getChessList().forEach((chess: DrawableChess) => {
      if (chess.selected) {
        chess.selected = false;
      }
    });
    this.fromPosTargetDrawer.clear(true);

    // 视角可能变化了，需要转换下
    let fromPos = this.convertViewPos(lastAction.fromPos, lastAction.chessHost);
    let toPos = this.convertViewPos(lastAction.toPos, lastAction.chessHost);
    let chess = this.chessboard.chessAt(toPos) as DrawableChess;

    // 动画移到之前的开始位置
    const {x, y} = this.chessboard.calcChessDisplayPos(fromPos);
    chess.setLit(false);
    new TWEEN.Tween(chess)
      .to({x, y}, 200)
      .easing(TWEEN.Easing.Circular.Out)
      .onComplete(() => {
        // 如果吃了子，把被吃的子加回来
        if (lastAction.eatenChess) {
          if (lastAction.eatenChess instanceof DrawableChess) {
              this.chessboard.addChess(lastAction.eatenChess);
          } else {
              this.chessboard.addChess(this.createDrawableChess(lastAction.eatenChess));
          }
        }
        
        // 恢复之前的状态
        chess.setPos(fromPos);
        this.chessboard.getChessArray()[fromPos.row][fromPos.col] = chess;
        this.chessboard.getChessArray()[toPos.row][toPos.col] = null;

        // 画上手的棋子走位标记
        if (this.chessActionStack.length > 0) {
          let prevAction = this.chessActionStack[this.chessActionStack.length - 1];
          let chess = this.chessboard.chessAt(
            this.convertViewPos(prevAction.toPos, prevAction.chessHost)) as DrawableChess;
          chess.setLit(true);
          this.fromPosTargetDrawer.draw(
            this.convertViewPos(prevAction.fromPos, prevAction.chessHost));
        }
        
        this.turnActiveChessHost();
      })
      .start();

    return this.chessActionStack.length > 0;
  }

  private clearChessboard() {
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        let chess = this.chessboard.chessAt(new ChessPos(row, col));
        if (chess) {
          this.chessboard.removeChess(chess);
        }
      }
    }
  }

  private turnActiveChessHost() {
    this.activeChessHost.value = ChessHost.reverse(this.activeChessHost.value);
  }
  
  public reverseChessLayoutView() {
    if (this.viewChessHost == null) {
      return;
    }
    // 保存下棋子引用
    let chesses: DrawableChess[] = [];
    this.chessboard.getChessList().forEach(chess => {
      chesses.push(chess);
    });
    // 清空棋盘
    this.clearChessboard();
    // 改变位置重新加上去
    chesses.forEach(chess => {
      chess.setPos(ChessPos.reverseView(chess.getPos()));
      this.chessboard.addChess(chess);
    });

    // 改变位置重新画标记
    let fromPos = this.fromPosTargetDrawer.getSavePos();
    if (fromPos) {
      this.fromPosTargetDrawer.draw(ChessPos.reverseView(fromPos));
    }

    this.lastViewChessHost = this.viewChessHost;
    this.viewChessHost = ChessHost.reverse(this.viewChessHost);
  }

  private initChessLayout() {
    this.clearChessboard();
    // 对面棋方棋子在上部
    const chessHost1 = ChessHost.reverse(this.viewChessHost);
    // 视角棋方棋子在下部
    const chessHost2 = this.viewChessHost;

    createIntialLayoutChessList(chessHost1, chessHost2).forEach(chess => {
      this.chessboard.addChess(this.createDrawableChess(chess));
    });
  }

  /**
   * 将源视角棋方的棋子位置转换为当前设置的视角棋方((this.viewChessHost)的棋子位置
   * @param pos 源视角棋方的棋子位置
   * @param chessHost 源视角棋方
   */
  private convertViewPos(pos: ChessPos, chessHost: ChessHost) {
    return this.viewChessHost == chessHost ? pos : ChessPos.reverseView(pos);
  }

  private checkCheckmate() {
    // 判断将军
    if (this.checkmate.check(ChessHost.reverse(this.activeChessHost.value))) {
      this.showText(`${this.activeChessHost.value == ChessHost.RED ? '红方' : '黑方'}将军!`, 2000);
    }
  }

  private createDrawableChess(chess: Chess) {
    return new DrawableChess(chess, this.chessboard.bounds.chessRadius);
  }

  public resize(stageWidth: number) {
    this.chessboard.resizeAndDraw(stageWidth, this.screen);
    if (this.fromPosTargetDrawer?.getSavePos()) {
      this.fromPosTargetDrawer.draw(this.fromPosTargetDrawer.getSavePos());
    }
  }

  private showText(text: string, duration?: number) {
    // eslint-disable-next-line
    this.textOverlay.show(text, duration);
  }

  private startTween() {
    const animate = (time: number) => {
      this.animationId = requestAnimationFrame(animate);
      TWEEN.update(time);
    };
    this.animationId = requestAnimationFrame(animate);
  }
}