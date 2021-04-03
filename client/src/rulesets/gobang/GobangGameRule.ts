import ChessAction from 'src/rulesets/gobang/ChessAction';
import ChessHost from 'src/rulesets/chess_host';
import HistoryRecorder from 'src/rulesets/gobang/HistoryRecorder';
import ResponseGameStates from 'src/rulesets/online/game_states_response';
import GameRule from 'src/rulesets/GameRule';
import GameAudio from 'src/rulesets/GameAudio';
import DrawableChess from "./ui/DrawableChess";
import Playfield from '../../pages/play/Playfield';
import GobangResponseGameStates, { ResponseGameStateChess } from './online/gameplay_server_messages';
import GobangDrawableChessboard from './ui/GobangDrawableChessboard';
import ChessPos from './ChessPos';
import ChessboardState from './ChessboardState';
import DrawableChessPool from './ui/DrawableChessPool';
import GobangGameSettings from './GobangGameSettings';

export default class GobangGameRule extends GameRule {
  public chessboard: GobangDrawableChessboard;

  public chessboardState: ChessboardState;

  public viewChessHost: ChessHost;

  private drawableChessPool: DrawableChessPool;

  private historyRecorder = new HistoryRecorder();

  constructor(gameSettings: GobangGameSettings) {
    super();
    this.chessboardState = new ChessboardState(gameSettings.chessboardSize);
  }

  public getChessboard() {
    return this.chessboard;
  }

  public setPlayfield(playfield: Playfield) {
    this.chessboard = playfield.chessboard as GobangDrawableChessboard;
    this.drawableChessPool = new DrawableChessPool(this.chessboard);
  }

  public start(viewChessHost: ChessHost, gameStates0?: ResponseGameStates) {
    super.start(viewChessHost, gameStates0);
    this.viewChessHost = viewChessHost;
    this.withdrawEnabled.value = false;
    this.chessboard.clear();
    this.chessboardState.clear();
    this.drawableChessPool.add();
    const gameStates = gameStates0 as GobangResponseGameStates;
    if (gameStates && gameStates.chesses) {
      // 把棋子放到棋盘上
      gameStates.chesses.forEach((stateChess: ResponseGameStateChess) => {
        const drawableChess = new DrawableChess();
        drawableChess.chess = stateChess.type;
        drawableChess.pos = new ChessPos(stateChess.row, stateChess.col);
        // eslint-disable-next-line
        this.chessboard.addChess(drawableChess);
        drawableChess.draw(this.chessboard.sizes);
        this.chessboardState.setChess(drawableChess.pos, drawableChess.chess);
      });
    }

    this.chessboard.show();

    this.historyRecorder.clear();

    if (gameStates) {
      this.historyRecorder.fromResponse(gameStates.actionStack);
      this.withdrawEnabled.value = !this.historyRecorder.isEmpty();
      const lastAction = this.historyRecorder.get(-1);
      if (lastAction) {
        const drawableChess = this.chessboard.chessAt(lastAction.pos);
        if (drawableChess) {
          drawableChess.marked = true;
        }
      }
    }

    this.activeChessHost.value = (gameStates && gameStates.activeChessHost) || ChessHost.FIRST;
  }

  public onChessAction(action: ChessAction) {
    this.chessboard.getChesses().forEach((chess) => {
      if (chess.marked) {
        chess.marked = false;
      }
    });

    const drawableChess = this.drawableChessPool.get() as DrawableChess;
    drawableChess.chess = action.chess;
    drawableChess.pos = action.pos;
    drawableChess.marked = true;
    drawableChess.draw(this.chessboard.sizes);

    GameAudio.play('games/gobang/chess_down1');

    this.chessboardState.setChess(action.pos, action.chess);

    this.historyRecorder.push(action);

    const fiveInRowPoss: ChessPos[] = [];
    if (this.checkWin(action.chess, action.pos, fiveInRowPoss)) {
      drawableChess.marked = false;
      this.gameOver(action.chess, fiveInRowPoss);
    }

    this.turnActiveChessHost();

    this.drawableChessPool.add();

    this.withdrawEnabled.value = true;
  }

  private turnActiveChessHost() {
    this.activeChessHost.value = ChessHost.reverse(this.activeChessHost.value as ChessHost);
  }

  public reverseChessLayoutView() {
    // eslint-disable-next-line
    this.viewChessHost = this.viewChessHost;
  }

  /** 悔棋 */
  public withdraw() {
    const lastAction = this.historyRecorder.pop();
    if (!lastAction) {
      return;
    }

    this.chessboard.getChesses().forEach((chess) => {
      if (chess.marked) {
        chess.marked = false;
      }
    });

    this.chessboard.removeChess(this.chessboard.chessAt(lastAction.pos) as DrawableChess);
    this.chessboardState.setChess(lastAction.pos, null);

    // 画上手的棋子走位标记
    if (!this.historyRecorder.isEmpty()) {
      const prevAction = this.historyRecorder.get(-1);

      (this.chessboard.chessAt(prevAction.pos) as DrawableChess).marked = true;
    }

    this.turnActiveChessHost();

    this.withdrawEnabled.value = !this.historyRecorder.isEmpty();
  }

  public checkWin(checkChess: ChessHost, origin: ChessPos, fiveInRowPoss: ChessPos[]): boolean {
    const scanSameCount = (dir: number[], poss: ChessPos[]): number => {
      const [dx, dy] = dir;
      let count = 0;
      let cur = origin.copy();
      for (let stop = false; !stop;) {
        cur = new ChessPos(cur.row + dy, cur.col + dx);
        if (true
          && (cur.row >= 0 && cur.row < this.chessboardState.size)
          && (cur.col >= 0 && cur.col < this.chessboardState.size)
          && (this.chessboardState.chessAt(cur) == checkChess)) {
          count++;
          poss.push(cur);
        } else {
          stop = true;
        }
      }

      return count;
    };

    const dirTable = [
      // [dx, dy]
      [0, -1], // 上
      [0, +1], // 下
      [-1, 0], // 左
      [+1, 0], // 右
      [-1, -1], // 左上
      [+1, +1], // 右下
      [+1, -1], // 右上
      [-1, +1], // 左下
    ];
    for (let i = 0; i < dirTable.length; i += 2) {
      const poss: ChessPos[] = [];
      const count = 1
        + scanSameCount(dirTable[i], poss)
        + scanSameCount(dirTable[i + 1], poss);
      if (count >= 5) {
        fiveInRowPoss.push(origin);
        poss.forEach((pos) => {
          fiveInRowPoss.push(pos);
        });
        return true;
      }
    }
    return false;
  }

  private gameOver(winChess: ChessHost, fiveInRowPoss: ChessPos[]) {
    this.onGameOver(winChess);

    fiveInRowPoss.forEach((pos) => {
      const chess = this.chessboard.chessAt(pos) as DrawableChess;
      chess.el.classList.add('highlight');
    });

    setTimeout(() => {
      this.gameEnd();
    }, 1000 * 0.5);
  }
}
