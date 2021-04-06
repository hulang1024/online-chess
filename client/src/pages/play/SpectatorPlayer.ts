import { onMounted } from "@vue/composition-api";
import * as GameEvents from 'src/online/play/gameplay_server_messages';
import GameState from "src/online/play/GameState";
import GameOverCause from "src/online/play/GameOverCause";
import { toReadableText } from 'src/online/play/confirm_request';
import SpectateResponse from "src/online/spectator/APISpectateResponse";
import SpectatorLeaveRequest from "src/online/spectator/SpectatorLeaveRequest";
import JoinRoomRequest from "src/online/room/JoinRoomRequest";
import User from "src/user/User";
import ChessHost from "src/rulesets/chess_host";
import Player from "./Player";
import GameUser from "../../online/play/GameUser";
import * as playPageSignals from './signals';

export default class SpectatorPlayer extends Player {
  private targetUserId: number | null;

  constructor(context: Vue, spectateResponse: SpectateResponse) {
    const { room } = spectateResponse;
    super(context, room, true, spectateResponse.states);
    this.targetUserId = spectateResponse.targetUserId;
    this.watchUser(this.targetUserId);

    onMounted(() => {
      switch (room.gameStatus) {
        case 0:
        case GameState.READY:
          break;
        case GameState.PAUSE:
          this.showText('你正在观战中，游戏暂停，请等待游戏继续');
          break;
        case GameState.PLAYING:
          this.showText('你正在观战中', 3000);
          break;
        case GameState.END:
          this.showText('你正在观战中，对局已经结束，请等待新对局');
          break;
        default:
          break;
      }
    });
  }

  protected onUserLeft(leftUser: GameUser) {
    super.onUserLeft(leftUser);
    // eslint-disable-next-line
    this.textOverlay.hide();
  }

  protected resultsReady(msg: GameEvents.ResultsReadyMsg) {
    super.resultsReady(msg);
    if (this.gameState.value == GameState.END) {
      this.gameState.value = GameState.READY;
      // eslint-disable-next-line
      this.textOverlay.hide();
    }
  }

  protected gameStartBefore() {
    if (this.targetUserId) {
      // 跟随观战用户的棋方
      this.game.viewChessHost = this.getGameUserByUserId(this.targetUserId)?.chessHost as ChessHost;
    } else {
      this.reverse.toggle();
    }
  }

  public onToggleViewClick() {
    super.onToggleViewClick();
    // 如果点击了切换，将不再跟随固定用户
    this.targetUserId = null;
  }

  protected resultsGameOver(msg: GameEvents.GameOverMsg) {
    super.resultsGameOver(msg);

    let text = '';
    if (msg.winUserId == null) {
      text = '平局';
    } else {
      const winner = msg.winUserId ? this.getGameUserByUserId(msg.winUserId) as GameUser : null;
      if (msg.cause != GameOverCause.NORMAL) {
        let event = '';
        if (msg.cause == GameOverCause.TIMEOUT) {
          event = '超时';
        } else if (msg.cause == GameOverCause.WHITE_FLAG) {
          event = '认输';
        }
        if (event) {
          const loser = ChessHost.reverse(winner?.chessHost as ChessHost);
          text += `${this.getChessHostName(loser)}${event}，`;
        }
      }
      const winnerName = winner?.user.value?.nickname || '';
      text += `${this.getChessHostName(winner?.chessHost as ChessHost)} (${winnerName}) 胜！`;
    }
    this.showText(text);
  }

  protected resultsConfirmRequest(msg: GameEvents.ConfirmRequestMsg) {
    super.resultsConfirmRequest(msg);
    const gameUser = this.getGameUserByUserId(msg.uid) as GameUser;
    this.showText(`${this.getChessHostName(gameUser.chessHost)}请求${toReadableText(msg.reqType)}`, 1000);
  }

  private watchUser(targetUserId: number) {
    const { room } = this;

    let watchingUser: User = this.api.localUser;

    if (targetUserId != null) {
      // 如果是观战固定用户
      watchingUser = room.gameUsers.find((u) => u.user?.id == targetUserId)?.user as User;
    } else if (room.gameUsers.length == 2) {
      watchingUser = room.gameUsers[+(Math.random() > 0.5)].user as User;
    } else {
      watchingUser = room.gameUsers[0].user as User;
    }

    // todo: 此localUser是继承自Player中指客户端本方游戏参与者用户，需要覆盖为非当前观众用户。
    // 此处具体设置为哪个参与者用户并无影响，观众端随便可切换视图以及目前其它功能正常工作，
    // localUser的值可能在构造器初始化之后就并不会再变化
    this.localUser.user.value = watchingUser;
    this.game.viewChessHost = this.getGameUserByUserId(watchingUser.id)?.chessHost as ChessHost;
  }

  public onQuitClick() {
    this.partRoom();
  }

  public onJoinGameClick() {
    if (this.localUser.user.value && this.otherUser.user.value) {
      return;
    }

    playPageSignals.reload.dispatch();
    playPageSignals.exited.addOnce(() => {
      const { $q } = this.context;
      $q.loading.show();
      const req = new JoinRoomRequest(this.room);
      req.success = async (result) => {
        await this.context.$router.push({
          name: 'play',
          replace: true,
          query: { room_id: result.room.id as unknown as string },
          params: {
            room: result.room as unknown as string,
          },
        });
        $q.loading.hide();
      };
      req.failure = () => {
        $q.notify({ type: 'warning', message: `加入房间失败` });
        $q.loading.hide();
        this.exitScreen();
      };
      this.api.perform(req);
    });
  }

  protected partRoom(name = '/') {
    const req = new SpectatorLeaveRequest(this.room);
    req.success = () => {
      super.exitScreen(name);
    };
    req.failure = () => {
      super.exitScreen(name);
    };
    this.api.perform(req);
  }
}
