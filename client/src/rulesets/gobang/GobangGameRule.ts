import ChessAction from 'src/rulesets/gobang/ChessAction';
import ChessHost from 'src/rulesets/chess_host';
import HistoryRecorder from 'src/rulesets/gobang/HistoryRecorder';
import ResponseGameStates from 'src/rulesets/game_states_response';
import GameRule from 'src/rulesets/GameRule';
import DrawableChess from "./ui/DrawableChess";
import Playfield from '../../pages/play/Playfield';
import GobangResponseGameStates, { ResponseGameStateChess } from './online/gameplay_server_messages';
import GobangDrawableChessboard from './ui/GobangDrawableChessboard';
import ChessPos from './ChessPos';
import { gridNumber } from './Chessboard';

export default class GobangGameRule extends GameRule {
  public chessboard: GobangDrawableChessboard;

  public viewChessHost: ChessHost;

  private historyRecorder = new HistoryRecorder();

  public getChessboard() {
    return this.chessboard;
  }

  public setPlayfield(playfield: Playfield) {
    this.chessboard = playfield.chessboard as GobangDrawableChessboard;
  }

  public start(viewChessHost: ChessHost, gameStates0?: ResponseGameStates) {
    this.viewChessHost = viewChessHost;
    this.canWithdraw.value = false;
    this.chessboard.clear();
    const gameStates = gameStates0 as GobangResponseGameStates;
    if (gameStates && gameStates.chesses) {
      // 把棋子放到棋盘上
      gameStates.chesses.forEach((stateChess: ResponseGameStateChess) => {
        // eslint-disable-next-line
        this.chessboard.addChess(
          new DrawableChess(
            stateChess.type,
            new ChessPos(stateChess.row, stateChess.col),
            this.chessboard.sizes,
          ),
        );
      });
    }

    this.chessboard.show();

    this.historyRecorder.clear();

    if (gameStates) {
      this.historyRecorder.fromResponse(gameStates.actionStack);
      const lastAction = this.historyRecorder.get(-1);
      if (lastAction) {
        const drawableChess = this.chessboard.chessAt(lastAction.pos);
        if (drawableChess) {
          drawableChess.lit = true;
        }
      }
    }

    this.activeChessHost.value = (gameStates && gameStates.activeChessHost) || ChessHost.FIRST;
  }

  public onChessAction(action: ChessAction) {
    this.chessboard.getChesses().forEach((chess) => {
      if (chess.lit) {
        chess.lit = false;
      }
    });

    const drawableChess = new DrawableChess(action.chess, action.pos, this.chessboard.sizes);
    drawableChess.lit = true;

    this.chessboard.addChess(drawableChess);

    this.historyRecorder.push(action);

    const fiveInRowPoss: ChessPos[] = [];
    if (this.checkWin(action.chess, action.pos, fiveInRowPoss)) {
      this.highlightChesses(fiveInRowPoss);
      this.onGameOver(action.chess);
    }

    this.turnActiveChessHost();

    this.canWithdraw.value = true;
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
      if (chess.lit) {
        chess.lit = false;
      }
    });

    this.chessboard.removeChess(this.chessboard.chessAt(lastAction.pos) as DrawableChess);

    // 画上手的棋子走位标记
    if (!this.historyRecorder.isEmpty()) {
      const prevAction = this.historyRecorder.get(-1);

      (this.chessboard.chessAt(prevAction.pos) as DrawableChess).lit = true;
    }

    this.turnActiveChessHost();

    this.canWithdraw.value = !this.historyRecorder.isEmpty();
  }

  public checkWin(checkChess: ChessHost, origin: ChessPos, fiveInRowPoss: ChessPos[]): boolean {
    const scanSameCount = (dir: number[], poss: ChessPos[]): number => {
      const [dx, dy] = dir;
      let count = 0;
      let cur = origin.copy();
      for (let stop = false; !stop;) {
        cur = new ChessPos(cur.row + dx, cur.col + dy);
        if (true
          && (cur.row >= 0 && cur.row < gridNumber)
          && (cur.col >= 0 && cur.col < gridNumber)
          && (this.chessboard.chessboardState.chessAt(cur) == checkChess)) {
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
      if (count == 5) {
        fiveInRowPoss.push(origin);
        poss.forEach((pos) => {
          fiveInRowPoss.push(pos);
        });
        return true;
      }
    }
    return false;
  }

  private highlightChesses(poss: ChessPos[]) {
    const toggleHighlight = (isAdd: boolean) => {
      poss.forEach((pos) => {
        const chess = this.chessboard.chessAt(pos) as DrawableChess;
        chess.el.classList[isAdd ? 'add' : 'remove']('highlight');
      });
    };
    toggleHighlight(true);
    setTimeout(() => {
      toggleHighlight(false);
    }, 5000);
  }
}
