import APIAccess, { APIState } from 'src/online/api/APIAccess';
import Channel from 'src/online/chat/Channel';
import ChannelManager from 'src/online/chat/ChannelManager';
import GameState from 'src/online/play/GameState';
import PartRoomRequest from 'src/online/room/PartRoomRequest';
import Room from 'src/online/room/Room';
import User from 'src/user/User';
import * as UserEvents from 'src/online/ws/events/user';
import * as GameEvents from 'src/online/ws/events/play';
import * as SpectatorEvents from 'src/online/ws/events/spectator';
import * as RoomEvents from 'src/online/ws/events/room';
import ResponseGameStates, { ResponseGameStateTimer } from 'src/online/play/game_states_response';
import SocketService from 'src/online/ws/SocketService';
import ChessHost from 'src/rule/chess_host';
import Bindable from 'src/utils/bindables/Bindable';
import BindableBool from 'src/utils/bindables/BindableBool';
import { onBeforeUnmount, onMounted } from '@vue/composition-api';
import ChessPos from 'src/rule/ChessPos';
import { api, channelManager, socketService } from 'src/boot/main';
import ConfirmRequest from 'src/rule/confirm_request';
import Signal from 'src/utils/signals/Signal';
import UserStatus from 'src/user/UserStatus';
import Timer from './timer/Timer';
import DrawableChess from './DrawableChess';
import DrawableChessboard from './DrawableChessboard';
import Player from './Player';
import CircleTimer from './timer/CircleTimer';

export default class GamePlay {
  public gameState = new Bindable<GameState>(GameState.READY);

  public activeChessHost = new Bindable<ChessHost>();

  public canWithdraw = new BindableBool();

  public user: User;

  public online = new BindableBool();

  public readied = new BindableBool();

  public chessHost = new Bindable<ChessHost>();

  public isRoomOwner = new BindableBool();

  public otherUser = new Bindable<User | null>();

  public otherOnline = new BindableBool();

  public otherUserStatus = new Bindable<UserStatus>();

  public otherReadied = new BindableBool();

  public otherChessHost = new Bindable<ChessHost>();

  public spectatorCount = new Bindable<number>(0);

  public isWaitingForOther = new Bindable<number>();

  public player: Player;

  public playerLoaded = new Signal();

  private gameTimer: Timer;

  private stepTimer: Timer;

  private otherGameTimer: Timer;

  private otherStepTimer: Timer;

  private disconnectHandler: () => void;

  private api: APIAccess;

  private socketService: SocketService;

  private channelManager: ChannelManager;

  private chessboard: DrawableChessboard;

  private room: Room;

  private lastSelected: DrawableChess | null;

  private resultDialog: any;

  private textOverlay: any;

  private context: Vue;

  constructor(
    context: Vue,
    room: Room | undefined,
    initialGameStates?: ResponseGameStates | undefined,
  ) {
    this.context = context;
    this.api = api;
    this.channelManager = channelManager;
    this.socketService = socketService;

    if (!(room || initialGameStates?.room)) {
      // 并不是进入房间，而是刷新网页时
      this.exitScreen();
      return;
    }

    this.user = this.api.localUser;
    this.room = room || initialGameStates?.room as Room;

    this.initListeners();

    this.playerLoaded.add(() => {
      this.player.gameOver.add(this.onGameOver, this);
      this.player.activeChessHost.changed.add(
        (v: ChessHost) => this.onTurnActiveChessHost(v, false), this,
      );
      this.chessboard = this.player.chessboard as unknown as DrawableChessboard;
      this.chessboard.chessPickupOrDrop.add(this.onChessPickupOrDrop, this);
      this.chessboard.clicked.add(this.onChessboardClick, this);
      this.chessboard.chessMoved.add(this.onInputChessMove, this);

      if (initialGameStates) {
        this.player.startGame(this.chessHost.value, initialGameStates);
      }

      this.gameState.addAndRunOnce(this.onGameStateChanged, this);
    });

    onMounted(() => {
      const { $refs } = this.context;

      this.resultDialog = $refs.resultDialog;
      this.textOverlay = $refs.textOverlay;

      this.gameTimer = ($refs.gameUserPanel as Vue).$refs.gameTimer as unknown as Timer;
      this.stepTimer = ($refs.gameUserPanel as Vue).$refs.stepTimer as unknown as Timer;
      this.otherGameTimer = ($refs.otherGameUserPanel as Vue).$refs.gameTimer as unknown as Timer;
      this.otherStepTimer = ($refs.otherGameUserPanel as Vue).$refs.stepTimer as unknown as Timer;
      (this.gameTimer as unknown as Vue).$on('ended', () => this.onTimerEnd(true, true));
      (this.stepTimer as unknown as Vue).$on('ended', () => this.onTimerEnd(false, true));
      (this.otherGameTimer as unknown as Vue).$on('ended', () => this.onTimerEnd(true, false));
      (this.otherStepTimer as unknown as Vue).$on('ended', () => this.onTimerEnd(false, false));
      (($refs.gameUserPanel as Vue)
        .$refs.circleStepTimer as unknown as CircleTimer).setSyncTimer(this.stepTimer);
      (($refs.otherGameUserPanel as Vue)
        .$refs.circleStepTimer as unknown as CircleTimer).setSyncTimer(this.otherStepTimer);

      this.loadState(initialGameStates);

      this.chessHost.addAndRunOnce((chessHost: ChessHost) => {
        this.otherChessHost.value = ChessHost.reverse(chessHost);
      });

      let channel = new Channel();
      channel.name = '#当前房间';
      channel.id = this.room.channelId;
      channel = this.channelManager.joinChannel(channel);
      // eslint-disable-next-line
      ($refs.chatPanel as any)?.loadChannel(channel);

      if (this.gameState.value == GameState.PAUSE) {
        this.showText('游戏暂停中，等待对手回来继续');
      }

      this.isWaitingForOther.changed.add((value: number) => {
        if (value == 0) {
          // eslint-disable-next-line
          this.textOverlay.hide();
          return;
        }
        const textMap: {[k: number]: string} = { 1: '等待玩家准备', 2: '等待玩家加入' };
        this.showText(textMap[value]);
      });

      if (this.gameState.value == GameState.READY && this.isRoomOwner.value) {
        this.isWaitingForOther.value = this.otherUser.value ? (this.otherReadied ? 1 : 0) : 2;
      }
    });

    onBeforeUnmount(() => {
      this.onQuit();
    });
  }

  private loadState(initialGameStates?: ResponseGameStates | undefined) {
    this.gameState.value = this.room.gameStatus || GameState.READY;
    this.isRoomOwner.value = this.room.owner.id == this.user.id;

    // 初始双方游戏状态和持棋方
    const {
      roomSettings: { gameDuration, stepDuration },
      redChessUser, blackChessUser,
      redReadied, blackReadied,
      redOnline, blackOnline,
      redUserStatus, blackUserStatus,
    } = this.room;

    this.gameTimer.setTotalSeconds(gameDuration);
    this.stepTimer.setTotalSeconds(stepDuration);
    this.otherGameTimer.setTotalSeconds(gameDuration);
    this.otherStepTimer.setTotalSeconds(stepDuration);

    let redTimer: ResponseGameStateTimer | null = null;
    let blackTimer: ResponseGameStateTimer | null = null;
    if (initialGameStates) {
      redTimer = initialGameStates.redTimer;
      blackTimer = initialGameStates.blackTimer;
    }

    if (redChessUser && this.user.id == redChessUser.id) {
      this.online.value = redOnline;
      this.readied.value = redReadied;
      this.chessHost.value = ChessHost.RED;
      this.otherUser.value = blackChessUser;
      this.otherOnline.value = blackOnline;
      this.otherUserStatus.value = blackUserStatus;
      this.otherReadied.value = blackReadied;
      this.gameTimer.ready(redTimer?.gameTime);
      this.stepTimer.ready(redTimer?.stepTime);
      this.otherGameTimer.ready(blackTimer?.gameTime);
      this.otherStepTimer.ready(blackTimer?.stepTime);
    }
    if (blackChessUser && this.user.id == blackChessUser.id) {
      this.online.value = blackOnline;
      this.readied.value = blackReadied;
      this.chessHost.value = ChessHost.BLACK;
      this.otherUser.value = redChessUser;
      this.otherOnline.value = redOnline;
      this.otherUserStatus.value = redUserStatus;
      this.otherReadied.value = redReadied;
      this.gameTimer.ready(blackTimer?.gameTime);
      this.stepTimer.ready(blackTimer?.stepTime);
      this.otherGameTimer.ready(redTimer?.gameTime);
      this.otherStepTimer.ready(redTimer?.stepTime);
    }

    this.spectatorCount.value = this.room.spectatorCount;
  }

  private onQuit() {
    [
      GameEvents.readied,
      GameEvents.chessPickup,
      GameEvents.chessMoved,
      GameEvents.gameStarted,
      GameEvents.confirmRequest,
      GameEvents.confirmResponse,
      SpectatorEvents.joined,
      SpectatorEvents.left,
    ].forEach((event) => {
      event.removeAll();
    });

    RoomEvents.userJoined.remove(this.onRoomUserJoinedEvent, this);
    RoomEvents.userLeft.remove(this.onRoomUserLeftEvent, this);
    UserEvents.offline.remove(this.onUserOfflineEvent, this);
    UserEvents.online.remove(this.onUserOnlineEvent, this);
    UserEvents.statusChanged.remove(this.onUserStatusChangedEvent, this);
    GameEvents.gameContinue.remove(this.onGameContinueEvent, this);
    GameEvents.gameContinueResponse.remove(this.onGameContinueResponseEvent, this);
    this.socketService.disconnect.remove(this.disconnectHandler);

    this.channelManager.leaveChannel(this.room.channelId);
  }

  private initListeners() {
    RoomEvents.userJoined.add(this.onRoomUserJoinedEvent, this);
    RoomEvents.userLeft.add(this.onRoomUserLeftEvent, this);

    UserEvents.offline.add(this.onUserOfflineEvent, this);
    UserEvents.online.add(this.onUserOnlineEvent, this);
    UserEvents.statusChanged.add(this.onUserStatusChangedEvent, this);

    GameEvents.readied.add(this.onGameReadyEvent, this);
    GameEvents.gameStarted.add(this.onGameStartedEvent, this);
    GameEvents.chessPickup.add(this.onGameChessPickupEvent, this);
    GameEvents.chessMoved.add(this.onGameChessMovedEvent, this);
    GameEvents.confirmRequest.add(this.onGameConfirmRequestEvent, this);
    GameEvents.confirmResponse.add(this.onGameConfirmResponseEvent, this);
    GameEvents.gameContinue.add(this.onGameContinueEvent, this);
    GameEvents.gameContinueResponse.add(this.onGameContinueResponseEvent, this);

    SpectatorEvents.joined.add((msg: SpectatorEvents.SpectatorJoinedMsg) => {
      this.spectatorCount.value = msg.spectatorCount;
    }, this);

    SpectatorEvents.left.add((msg: SpectatorEvents.SpectatorLeftMsg) => {
      this.spectatorCount.value = msg.spectatorCount;
    }, this);

    this.socketService.disconnect.add(this.disconnectHandler = () => {
      if ([GameState.READY, GameState.END].includes(this.gameState.value)) {
        this.exitScreen();
        return;
      }

      this.gameState.value = GameState.PAUSE;
      this.online.value = false;
    }, this);

    api.state.changed.addOnce((state: APIState) => {
      if (state == APIState.offline) {
        this.exitScreen();
      }
    });
  }

  private onGameReadyEvent(msg: GameEvents.GameReadyMsg) {
    if (msg.uid == this.user.id) {
      this.readied.value = msg.readied;
    } else {
      this.otherReadied.value = msg.readied;
    }

    if (this.isRoomOwner.value) {
      if (this.otherUser.value && !this.otherReadied.value) {
        this.isWaitingForOther.value = 1;
      } else {
        this.isWaitingForOther.value = 0;
      }
    }
  }

  private onGameStartedEvent(msg: GameEvents.GameStartedMsg) {
    this.chessHost.value = msg.redChessUid == this.user.id
      ? ChessHost.RED
      : ChessHost.BLACK;

    this.lastSelected = null;

    this.gameState.value = GameState.PLAYING;

    const { roomSettings: { gameDuration, stepDuration } } = this.room;
    this.gameTimer.setTotalSeconds(gameDuration);
    this.stepTimer.setTotalSeconds(stepDuration);
    this.otherGameTimer.setTotalSeconds(gameDuration);
    this.otherStepTimer.setTotalSeconds(stepDuration);
    this.gameTimer.ready();
    this.stepTimer.ready();
    this.otherGameTimer.ready();
    this.otherStepTimer.ready();

    this.player.startGame(this.chessHost.value);
    // 因为activeChessHost一般一直是红方，值相同将不能触发，这里手动触发一次
    this.onTurnActiveChessHost(this.activeChessHost.value);
    this.showText(`开始对局`, 1000);
  }

  private onGameChessPickupEvent(msg: GameEvents.ChessPickUpMsg) {
    if (msg.chessHost == this.chessHost.value) {
      return;
    }
    window.focus();

    this.player.pickChess(msg.pickup, ChessPos.make(msg.pos), msg.chessHost);
  }

  private onGameChessMovedEvent(msg: GameEvents.ChessMoveMsg) {
    if (msg.chessHost == this.chessHost.value) {
      return;
    }
    window.focus();

    this.player.moveChess(
      ChessPos.make(msg.fromPos),
      ChessPos.make(msg.toPos),
      msg.chessHost, msg.moveType,
    );
  }

  private onGameConfirmRequestEvent(msg: GameEvents.ConfirmRequestMsg) {
    // 如果是自己发送的请求
    if (msg.chessHost == this.chessHost.value) {
      return;
    }

    // 对方发送的请求
    const onAction = (isOk: boolean) => {
      this.socketService.send('play.confirm_response', { reqType: msg.reqType, ok: isOk });
    };
    // 显示确认对话框
    this.context.$q.dialog({
      title: '确认',
      message: `对手想要${ConfirmRequest.toReadableText(msg.reqType)}`,
      persistent: true,
      ok: {
        label: '同意',
        color: 'primary',
      },
      cancel: {
        label: '不同意',
        color: 'negative',
      },
    }).onOk(() => onAction(true))
      .onCancel(() => onAction(false));
  }

  private onGameConfirmResponseEvent(msg: GameEvents.ConfirmResponseMsg) {
    // 如果同意
    if (!msg.ok) {
      // 对方发送的回应
      if (msg.chessHost != this.chessHost.value) {
        this.showText(`对方不同意${ConfirmRequest.toReadableText(msg.reqType)}`, 1000);
      }
      return;
    }

    // 如果不同意
    if (msg.chessHost != this.chessHost.value) {
      this.showText(`对方同意${ConfirmRequest.toReadableText(msg.reqType)}`, 1000);
    }

    switch (msg.reqType) {
      case ConfirmRequest.Type.WHITE_FLAG:
        this.onGameOver(msg.chessHost);
        break;
      case ConfirmRequest.Type.DRAW:
        this.onGameOver(null);
        break;
      case ConfirmRequest.Type.WITHDRAW: {
        const canWithdraw = this.player.withdraw();
        this.canWithdraw.value = canWithdraw;
        break;
      }
      default:
        break;
    }
  }

  private onGameContinueEvent() {
    this.online.value = true;
    if (this.online.value && this.otherOnline.value) {
      this.gameState.value = GameState.PLAYING;
    }
    this.socketService.send('play.game_continue', { ok: true });
  }

  private onGameContinueResponseEvent(msg: GameEvents.GameContinueResponseMsg) {
    if (this.user.id == msg.uid) {
      return;
    }
    this.otherOnline.value = true;
    if (msg.ok) {
      this.gameState.value = GameState.PLAYING;
      this.showText('对手已回来，对局继续', 3000);
    } else {
      this.gameState.value = GameState.READY;
      this.otherUser.value = null;
      this.showText('对手已选择不继续对局', 2000);
      setTimeout(() => {
        this.isWaitingForOther.value = 1;
      }, 2000);
    }
  }

  private onRoomUserJoinedEvent(msg: RoomEvents.RoomUserJoinedMsg) {
    window.focus();
    this.otherUser.value = msg.user;
    this.otherOnline.value = true;
    this.otherUserStatus.value = UserStatus.ONLINE;
    this.otherReadied.value = false;
    this.isWaitingForOther.value = 1;
    this.context.$q.notify(`${this.otherUser.value.nickname} 加入棋桌`);
  }

  private onRoomUserLeftEvent(msg: RoomEvents.RoomUserLeftMsg) {
    if (msg.uid == this.user.id) return;

    this.otherUser.value = null;
    this.otherReadied.value = false;
    this.otherOnline.value = false;
    this.gameState.value = GameState.READY;
    this.otherStepTimer.stop();
    this.otherGameTimer.stop();
    const { roomSettings: { gameDuration, stepDuration } } = this.room;
    this.otherGameTimer.setTotalSeconds(gameDuration);
    this.otherStepTimer.setTotalSeconds(stepDuration);
    this.otherStepTimer.ready();
    this.otherGameTimer.ready();

    this.isWaitingForOther.value = 2;
    this.context.$q.notify('对手已离开棋桌');
    if (!this.isRoomOwner.value) {
      this.isRoomOwner.value = true;
      this.context.$q.notify('你成为了房主');
    }
  }

  private onUserOfflineEvent(msg: UserEvents.UserOfflineMsg) {
    if (this.gameState.value == GameState.READY
      || !(this.otherUser.value && this.otherUser.value.id == msg.uid)) {
      return;
    }
    this.otherOnline.value = false;
    this.gameState.value = GameState.PAUSE;
    this.showText('对手已下线/掉线，你可以等待对方回来继续');
  }

  private onUserOnlineEvent(msg: UserEvents.UserOnlineMsg) {
    // 判断是否原来就没加入过房间
    if (this.gameState.value == GameState.READY
      || !(this.otherUser.value && this.otherUser.value.id == msg.uid)) {
      return;
    }
    this.otherOnline.value = true;
    this.context.$q.notify('对手已上线');
  }

  private onUserStatusChangedEvent(msg: UserEvents.UserStatusChangedMsg) {
    if (!(this.otherUser.value && this.otherUser.value.id == msg.uid)) {
      return;
    }
    this.otherUserStatus.value = msg.status;
  }

  private onGameStateChanged(gameState: GameState, prevGameState: GameState) {
    switch (gameState) {
      case GameState.PLAYING: {
        if (prevGameState == GameState.PAUSE) {
          // 之前离线暂停，现在恢复
          if (this.activeChessHost.value == this.chessHost.value) {
            this.gameTimer.resume();
            this.stepTimer.resume();
            this.onTurnActiveChessHost(this.activeChessHost.value, true);
          } else {
            this.otherGameTimer.resume();
            this.otherStepTimer.resume();
          }
          this.showText('游戏继续', 1000);
        }
        break;
      }
      case GameState.READY:
      case GameState.PAUSE:
      case GameState.END: {
        // 禁用棋盘
        this.chessboard.enabled = false;
        this.chessboard.getChessList().forEach((chess: DrawableChess) => {
          chess.enabled = false;
        });
        // 当游戏暂停或结束，暂停计时器
        [
          this.gameTimer, this.stepTimer,
          this.otherGameTimer, this.otherStepTimer,
        ].forEach((timer) => {
          timer.pause();
        });
        break;
      }
      default:
        break;
    }
  }

  private onGameOver(winChessHost: ChessHost | null, isTimeout?: boolean) {
    this.gameState.value = GameState.END;

    const winUserId = winChessHost == null
      ? undefined
      : (winChessHost == this.chessHost.value
        ? this.user.id
        : this.otherUser.value?.id);
    if (this.isRoomOwner.value) {
      this.socketService.send('play.game_over', { winUserId });
      this.otherReadied.value = false;
    }

    // eslint-disable-next-line
    this.resultDialog.open({
      result: winChessHost == null ? 0 : winChessHost == this.chessHost.value ? 1 : 2,
      isTimeout,
      action: (option: string) => {
        if (option == 'again') {
          if (this.isRoomOwner.value) {
            if (!this.otherReadied.value) {
              this.isWaitingForOther.value = 1;
            }
          } else {
            this.socketService.send('play.ready', { readied: true });
          }
          this.gameState.value = GameState.READY;
        } else {
          this.partRoom();
        }
      },
    });
  }

  public onTimerEnd(isGameTimer: boolean, isThisUser: boolean) {
    if (isGameTimer) {
      // 如果局时用完，步时计时器用作读秒计数器
      const { roomSettings } = this.room;
      if (isThisUser) {
        this.stepTimer.setTotalSeconds(roomSettings.secondsCountdown);
      } else {
        this.otherStepTimer.setTotalSeconds(roomSettings.secondsCountdown);
      }
    } else {
      // 如果步时/读秒时间用完
      const winChessHost = isThisUser ? this.otherChessHost.value : this.chessHost.value;
      this.onGameOver(winChessHost, true);
    }
  }

  private onTurnActiveChessHost(activeChessHost: ChessHost, isGameResume = false) {
    this.activeChessHost.value = activeChessHost;

    if (this.gameState.value != GameState.PLAYING) {
      return;
    }

    if (!isGameResume) {
      if (activeChessHost == this.chessHost.value) {
        this.stepTimer.start();
        this.gameTimer.resume();
        this.otherStepTimer.stop();
        this.otherGameTimer.pause();
      } else {
        this.stepTimer.stop();
        this.gameTimer.pause();
        this.otherStepTimer.start();
        this.otherGameTimer.resume();
      }

      this.canWithdraw.value = true;
    }

    this.chessboard.enabled = this.activeChessHost.value == this.chessHost.value;
    this.chessboard.getChessList().forEach((chess) => {
      // 如果当前是本方走，将敌方棋子禁用；否则，全部禁用
      chess.enabled = this.activeChessHost.value == this.chessHost.value
        ? this.chessHost.value == chess.getHost()
        : false;
    });
    this.lastSelected = null;
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
        if (chess?.canGoTo(toPos, this.player)) {
          this.onUserMoveChess(1, fromPos, toPos);
        }
      }
      return;
    }
    // 点击了一个棋子
    if (this.lastSelected == null) {
      // 并且之前并未选择棋子
      // 现在是选择要走的棋子，只能先选中持棋方棋子
      if (event.chess.getHost() == this.activeChessHost.value) {
        this.lastSelected = event.chess;
        this.lastSelected.selected = true;
        this.onChessPickupOrDrop({ chess: event.chess, isPickup: true });
        // 将非持棋方的棋子全部启用（这样下次才能点击要吃的目标棋子）
        this.chessboard.getChessList().forEach((chess) => {
          if (chess.getHost() != this.chessHost.value) {
            chess.enabled = true;
          }
        });
      }
      return;
    }

    if (event.chess.selected && event.chess.getHost() == this.chessHost.value) {
      // 重复点击，取消选中
      this.lastSelected.selected = false;
      this.onChessPickupOrDrop({ chess: event.chess, isPickup: false });
      this.lastSelected = null;
      return;
    }

    // 当选择了两个棋子（包括了空棋子），并且两个棋子属于不同棋方，是吃子
    if (event.chess.getHost() != this.activeChessHost.value) {
      const fromPos = this.lastSelected.getPos();
      const toPos = event.pos;
      const chess = this.chessboard.chessAt(fromPos);
      if (chess?.canGoTo(toPos, this.player)) {
        this.onUserMoveChess(2, fromPos, toPos);
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
    if (toPos.equals(chess.getPos())) {
      return;
    }
    if (chess.getHost() != this.chessHost.value) {
      return;
    }
    if (this.lastSelected) {
      this.lastSelected.selected = false;
    }
    if (chess.canGoTo(toPos, this.player)) {
      const isMove = this.chessboard.isEmpty(toPos.row, toPos.col);
      if (!isMove && this.chessboard.chessAt(toPos)?.getHost() == chess.getHost()) {
        return;
      }
      this.onUserMoveChess(isMove ? 1 : 2, chess.getPos(), toPos, 0);
    }
  }

  private onUserMoveChess(moveType: number, fromPos: ChessPos, toPos: ChessPos, duration?: number) {
    this.player.moveChess(fromPos, toPos, this.chessHost.value, moveType, duration);
    this.socketService.send('play.chess_move', {
      moveType,
      fromPos,
      toPos,
    });
  }

  private onChessPickupOrDrop({ chess, isPickup } : {chess: DrawableChess, isPickup: boolean}) {
    this.socketService.send('play.chess_pick', {
      pos: chess.getPos(),
      pickup: isPickup,
    });
  }

  public onReadyStartClick() {
    if (this.isRoomOwner.value) {
      if (this.readied && this.otherReadied) {
        this.socketService.send('play.start_game');
      }
    } else {
      this.socketService.send('play.ready');
    }
  }

  public onWhiteFlagClick() {
    this.socketService.send('play.confirm_request', { reqType: ConfirmRequest.Type.WHITE_FLAG });
    this.showText('已发送认输请求，等待对方回应', 1000);
  }

  public onChessDrawClick() {
    this.socketService.send('play.confirm_request', { reqType: ConfirmRequest.Type.DRAW });
    this.showText('已发送和棋请求，等待对方回应', 1000);
  }

  public onWithdrawClick() {
    this.socketService.send('play.confirm_request', { reqType: ConfirmRequest.Type.WITHDRAW });
    this.showText('已发送悔棋请求，等待对方回应', 1000);
  }

  public onQuitClick() {
    if ([GameState.READY, GameState.END].includes(this.gameState.value)) {
      this.partRoom();
    } else {
      const isPlaying = this.gameState.value == GameState.PLAYING;
      let text = '是否真的离开？';
      if (isPlaying) {
        text = '游戏进行中，是否真的离开？';
      }
      if (this.gameState.value == GameState.PAUSE) {
        text = '游戏暂停中，是否解散棋局？<br>(你也可以退出登录，棋局将保留3小时)';
      }
      this.context.$q.dialog({
        title: '确认',
        message: text,
        html: true,
        persistent: true,
        ok: {
          label: '取消',
          color: 'primary',
        },
        cancel: {
          label: isPlaying ? '离开' : '解散棋局',
          color: 'negative',
        },
      }).onCancel(() => {
        this.gameState.value = GameState.END;
        this.partRoom();
      });
    }
  }

  public onInviteClick() {
    // eslint-disable-next-line
    (this.context.$vnode.context?.$refs.toolbar as any).toggle('socialBrowser');
  }

  private showText(text: string, duration?: number) {
    // eslint-disable-next-line
    this.textOverlay.show(text, duration);
  }

  public partRoom() {
    if (!this.room) {
      this.exitScreen();
      return;
    }
    const req = new PartRoomRequest(this.room);
    req.success = () => {
      this.exitScreen();
    };
    req.failure = () => {
      this.exitScreen();
    };
    this.api.queue(req);
  }

  private exitScreen() {
    // eslint-disable-next-line
    this.context.$router.push('/');
  }
}
