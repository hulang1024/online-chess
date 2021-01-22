import APIAccess, { APIState } from 'src/online/api/APIAccess';
import Channel from 'src/online/chat/Channel';
import ChannelManager from 'src/online/chat/ChannelManager';
import GameState from 'src/online/play/GameState';
import PartRoomRequest from 'src/online/room/PartRoomRequest';
import Room from 'src/online/room/Room';
import * as UserEvents from 'src/online/ws/events/user';
import * as GameEvents from 'src/online/ws/events/play';
import * as SpectatorEvents from 'src/online/ws/events/spectator';
import * as RoomEvents from 'src/online/ws/events/room';
import ResponseGameStates from 'src/online/play/game_states_response';
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
import User from 'src/user/User';
import Timer from './timer/Timer';
import DrawableChess from './DrawableChess';
import DrawableChessboard from './DrawableChessboard';
import Playfield from './Playfield';
import CircleTimer from './timer/CircleTimer';
import GameUser from './GameUser';
import GameAudio from './GameAudio';

export default class Player {
  public gameState = new Bindable<GameState>(GameState.READY);

  public activeChessHost = new Bindable<ChessHost | null>();

  public canWithdraw = new BindableBool();

  public localUser = new GameUser();

  public otherUser = new GameUser();

  public spectatorCount = new Bindable<number>(0);

  public playfield: Playfield;

  public playfieldLoaded = new Signal();

  private disconnectHandler: () => void;

  private api: APIAccess;

  private socketService: SocketService;

  private channelManager: ChannelManager;

  private chessboard: DrawableChessboard;

  private room: Room;

  private lastSelected: DrawableChess | null;

  private useView3: boolean;

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

    this.localUser.bindable.value = this.api.localUser;
    this.room = room || initialGameStates?.room as Room;

    this.initListeners();

    this.playfieldLoaded.add(() => {
      this.playfield.gameOver.add((winChessHost: ChessHost) => {
        const gameUser = this.localUser.chessHost == winChessHost ? this.localUser : this.otherUser;
        this.socketService.send('play.game_over', { winUserId: gameUser.id });
      }, this);
      this.playfield.activeChessHost.changed.add(
        (v: ChessHost) => this.onTurnActiveChessHost(v, false), this,
      );
      this.chessboard = this.playfield.chessboard as unknown as DrawableChessboard;
      this.chessboard.chessPickupOrDrop.add(this.onChessPickupOrDrop, this);
      this.chessboard.clicked.add(this.onChessboardClick, this);
      this.chessboard.chessMoved.add(this.onInputChessMove, this);

      if (initialGameStates) {
        this.playfield.startGame(this.localUser.chessHost, initialGameStates);
      }

      this.gameState.addAndRunOnce(this.onGameStateChanged, this);
    });

    onMounted(() => {
      const { $refs } = this.context;

      this.resultDialog = $refs.resultDialog;
      this.textOverlay = $refs.textOverlay;

      this.initTimers();
      this.loadState(initialGameStates);

      this.localUser.chessHostBindable.addAndRunOnce((chessHost: ChessHost) => {
        this.otherUser.chessHostBindable.value = ChessHost.reverse(chessHost);
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
    });

    onBeforeUnmount(() => {
      this.onQuit();
    });
  }

  private loadState(initialGameStates?: ResponseGameStates | undefined) {
    this.gameState.value = this.room.gameStatus || GameState.READY;

    // 初始双方游戏状态和持棋方
    if (this.localUser.id == this.room.redChessUser?.id) {
      this.localUser.chessHostBindable.value = ChessHost.RED;
      this.otherUser.chessHostBindable.value = ChessHost.BLACK;
    }
    if (this.localUser.id == this.room.blackChessUser?.id) {
      this.localUser.chessHostBindable.value = ChessHost.BLACK;
      this.otherUser.chessHostBindable.value = ChessHost.RED;
    }

    const setGameUser = (gameUser: GameUser) => {
      const data = this.room as {[k: string]: any };
      const keyP = ChessHost.RED == gameUser.chessHost ? 'red' : 'black';
      gameUser.bindable.value = data[`${keyP}ChessUser`] as User;
      gameUser.online.value = data[`${keyP}Online`] as boolean;
      gameUser.status.value = data[`${keyP}UserStatus`] as number;
      gameUser.readied.value = data[`${keyP}Readied`] as boolean;

      const { roomSettings } = this.room;
      const { gameTimer, stepTimer } = gameUser;
      gameTimer.setTotalSeconds(roomSettings.gameDuration);
      stepTimer.setTotalSeconds(roomSettings.stepDuration);
      if (initialGameStates) {
        const timerState = {
          red: initialGameStates.redTimer,
          black: initialGameStates?.blackTimer,
        }[keyP];
        gameTimer.ready(timerState.gameTime);
        stepTimer.ready(timerState.stepTime);
      } else {
        gameTimer.ready();
        stepTimer.ready();
      }
    };

    setGameUser(this.localUser);
    setGameUser(this.otherUser);

    this.localUser.isRoomOwner.value = this.room.owner.id == this.localUser.id;

    this.spectatorCount.value = this.room.spectatorCount;
  }

  private initTimers() {
    const viewGameUserPanelRefs = (this.context.$refs.viewGameUserPanel as Vue).$refs;
    const otherGameUserPanelRefs = (this.context.$refs.otherGameUserPanel as Vue).$refs;
    this.localUser.gameTimer = viewGameUserPanelRefs.gameTimer as unknown as Timer;
    (this.localUser.gameTimer as unknown as Vue).$on('ended',
      () => this.onTimerEnd(true, this.localUser));
    this.localUser.stepTimer = viewGameUserPanelRefs.stepTimer as unknown as Timer;
    (this.localUser.stepTimer as unknown as Vue).$on('ended',
      () => this.onTimerEnd(false, this.localUser));
    this.localUser.stepTimer.setSoundEnabled(true);
    this.otherUser.gameTimer = otherGameUserPanelRefs.gameTimer as unknown as Timer;
    (this.otherUser.gameTimer as unknown as Vue).$on('ended',
      () => this.onTimerEnd(true, this.otherUser));
    this.otherUser.stepTimer = otherGameUserPanelRefs.stepTimer as unknown as Timer;
    (this.otherUser.stepTimer as unknown as Vue).$on('ended',
      () => this.onTimerEnd(false, this.otherUser));
    (viewGameUserPanelRefs.circleStepTimer as unknown as CircleTimer)
      .setSyncTimer(this.localUser.stepTimer);
    (otherGameUserPanelRefs.circleStepTimer as unknown as CircleTimer)
      .setSyncTimer(this.otherUser.stepTimer);
  }

  private onQuit() {
    [
      GameEvents.chessPickup,
      GameEvents.chessMoved,
      GameEvents.chessWithdraw,
      GameEvents.readied,
      GameEvents.gameStarted,
      GameEvents.gameOver,
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
    GameEvents.gameOver.add(this.onGameOverEvent, this);
    GameEvents.chessPickup.add(this.onGameChessPickupEvent, this);
    GameEvents.chessMoved.add(this.onGameChessMovedEvent, this);
    GameEvents.chessWithdraw.add(this.onGameChessWithdrawEvent, this);
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
      this.localUser.online.value = false;
    }, this);

    api.state.changed.addOnce((state: APIState) => {
      if (state == APIState.offline) {
        this.exitScreen();
      }
    });
  }

  private onGameReadyEvent(msg: GameEvents.GameReadyMsg) {
    const gameUser = this.getGameUserByUserId(msg.uid) as GameUser;
    gameUser.readied.value = msg.readied;
  }

  private onGameStartedEvent(msg: GameEvents.GameStartedMsg) {
    const redGameUser = this.getGameUserByUserId(msg.redChessUid) as GameUser;
    const blackGameUser = this.getGameUserByUserId(msg.blackChessUid) as GameUser;
    redGameUser.chessHostBindable.value = ChessHost.RED;
    blackGameUser.chessHostBindable.value = ChessHost.BLACK;

    this.lastSelected = null;
    this.canWithdraw.value = false;
    this.gameState.value = GameState.PLAYING;

    const { roomSettings: { gameDuration, stepDuration } } = this.room;

    [redGameUser, blackGameUser].forEach(({ gameTimer, stepTimer }) => {
      gameTimer.setTotalSeconds(gameDuration);
      stepTimer.setTotalSeconds(stepDuration);
      gameTimer.ready();
      stepTimer.ready();
    });

    this.playfield.startGame(this.localUser.chessHost);
    // 因为activeChessHost一般一直是红方，值相同将不能触发，这里手动触发一次
    this.onTurnActiveChessHost(this.activeChessHost.value as ChessHost);
    this.showText(`开始对局`, 1000);
  }

  private onGameOverEvent(msg: GameEvents.GameOverMsg) {
    this.gameState.value = GameState.END;

    if (this.localUser.isRoomOwner.value) {
      this.otherUser.readied.value = false;
    }

    const result = msg.winUserId ? (this.localUser.id == msg.winUserId ? 1 : 2) : 0;

    // eslint-disable-next-line
    this.resultDialog.open({
      result,
      isTimeout: msg.timeout,
      action: (option: string) => {
        if (option == 'again') {
          if (!this.localUser.isRoomOwner.value) {
            this.socketService.send('play.ready', { readied: true });
          }
          this.gameState.value = GameState.READY;
        } else {
          this.partRoom();
        }
      },
    });
  }

  private onGameChessPickupEvent(msg: GameEvents.ChessPickUpMsg) {
    this.playfield.pickChess(msg.pickup, ChessPos.make(msg.pos), msg.chessHost);
  }

  private onGameChessMovedEvent(msg: GameEvents.ChessMoveMsg) {
    this.playfield.moveChess(
      ChessPos.make(msg.fromPos),
      ChessPos.make(msg.toPos),
      msg.chessHost, msg.moveType,
    );
    this.canWithdraw.value = true;
  }

  private onGameChessWithdrawEvent() {
    const canWithdraw = this.playfield.withdraw();
    this.canWithdraw.value = canWithdraw;
  }

  private onGameConfirmRequestEvent(msg: GameEvents.ConfirmRequestMsg) {
    // 对方发送的请求
    const onAction = (isOk: boolean) => {
      this.socketService.send('play.confirm_response', { reqType: msg.reqType, ok: isOk });
    };
    // 显示确认对话框
    this.context.$q.dialog({
      title: '确认',
      message: `对方想要${ConfirmRequest.toReadableText(msg.reqType)}`,
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
    const title = this.useView3 ? (ChessHost.BLACK ? '黑方' : '红方') : '对方';
    this.showText(`${title}${msg.ok ? '同意' : '不同意'}${ConfirmRequest.toReadableText(msg.reqType)}`, 1000);
  }

  private onGameContinueEvent() {
    this.localUser.online.value = true;
    if (this.localUser.online.value && this.otherUser.online.value) {
      this.gameState.value = GameState.PLAYING;
    }
    this.socketService.send('play.game_continue', { ok: true });
  }

  private onGameContinueResponseEvent(msg: GameEvents.GameContinueResponseMsg) {
    this.otherUser.online.value = true;

    if (msg.ok) {
      if (this.localUser.online.value && this.otherUser.online.value) {
        this.gameState.value = GameState.PLAYING;
      }
      this.showText('对手已回来，对局继续', 3000);
    } else {
      this.gameState.value = GameState.READY;
      this.otherUser.bindable.value = null;
      this.showText('对手已选择不继续对局', 2000);
    }
  }

  private onRoomUserJoinedEvent(msg: RoomEvents.RoomUserJoinedMsg) {
    const gameUser = msg.user.id == this.localUser.id
      ? this.localUser
      : this.otherUser;

    gameUser.bindable.value = msg.user;
    gameUser.online.value = true;
    gameUser.status.value = UserStatus.ONLINE;
    gameUser.readied.value = false;

    this.context.$q.notify(`${msg.user.nickname} 加入`);
    GameAudio.play('room/user_join');
  }

  private onRoomUserLeftEvent(msg: RoomEvents.RoomUserLeftMsg) {
    this.gameState.value = GameState.READY;

    const gameUser = msg.uid == this.localUser.id
      ? this.localUser
      : this.otherUser;
    const leftUser = gameUser.bindable.value as unknown as User;
    const { gameTimer, stepTimer } = gameUser;
    const { roomSettings: { gameDuration, stepDuration } } = this.room;

    gameUser.bindable.value = null;
    gameUser.readied.value = false;
    gameUser.online.value = false;

    gameTimer.stop();
    stepTimer.stop();
    gameTimer.setTotalSeconds(gameDuration);
    stepTimer.setTotalSeconds(stepDuration);
    stepTimer.ready();
    gameTimer.ready();

    this.activeChessHost.value = null;

    this.context.$q.notify(`${leftUser.nickname} 离开房间`);
    GameAudio.play('room/user_left');

    if (!this.localUser.isRoomOwner.value) {
      this.localUser.isRoomOwner.value = true;
      this.context.$q.notify('你成为了房主');
    }
  }

  private onUserOfflineEvent(msg: UserEvents.UserOfflineMsg) {
    const gameUser = this.getGameUserByUserId(msg.uid);
    if (!gameUser) {
      return;
    }
    gameUser.online.value = false;
    this.gameState.value = GameState.PAUSE;
    this.showText(`${msg.nickname}已下线/掉线，你可以等待对方回来继续`);
  }

  private onUserOnlineEvent(msg: UserEvents.UserOnlineMsg) {
    const gameUser = this.getGameUserByUserId(msg.uid);
    if (!gameUser) {
      return;
    }
    gameUser.online.value = true;
    this.context.$q.notify(`${msg.nickname}已上线`);
  }

  private onUserStatusChangedEvent(msg: UserEvents.UserStatusChangedMsg) {
    const gameUser = this.getGameUserByUserId(msg.uid);
    if (!gameUser) {
      return;
    }
    gameUser.status.value = msg.status;
  }

  private getGameUserByUserId(id: number): GameUser | null {
    let gameUser: GameUser | null = null;
    if (id == this.localUser.id) {
      gameUser = this.localUser;
    }
    if (id == this.otherUser.id) {
      gameUser = this.otherUser;
    }
    return gameUser;
  }

  private onGameStateChanged(gameState: GameState, prevGameState: GameState) {
    switch (gameState) {
      case GameState.PLAYING: {
        if (prevGameState == GameState.PAUSE) {
          // 之前离线暂停，现在恢复
          let activeGameUser: GameUser;
          if (this.activeChessHost.value == this.localUser.chessHost) {
            activeGameUser = this.localUser;
            this.onTurnActiveChessHost(this.activeChessHost.value, true);
          } else {
            activeGameUser = this.otherUser;
          }
          activeGameUser.gameTimer.resume();
          activeGameUser.stepTimer.resume();
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
          this.localUser.gameTimer, this.localUser.stepTimer,
          this.otherUser.gameTimer, this.otherUser.stepTimer,
        ].forEach((timer) => {
          timer.pause();
        });
        break;
      }
      default:
        break;
    }
  }

  public onTimerEnd(isGameTimer: boolean, gameUser: GameUser) {
    if (isGameTimer) {
      // 如果局时用完，步时计时器用作读秒计数器
      gameUser.stepTimer.setTotalSeconds(this.room.roomSettings.secondsCountdown);
    } else {
      // 如果步时/读秒时间用完
      this.socketService.send('play.game_over', { winUserId: gameUser.id, timeout: true });
    }
  }

  private onTurnActiveChessHost(activeChessHost: ChessHost, isGameResume = false) {
    this.activeChessHost.value = activeChessHost;

    if (this.gameState.value != GameState.PLAYING) {
      return;
    }

    if (!isGameResume) {
      let activeGameUser: GameUser;
      let inactiveGameUser: GameUser;
      if (this.activeChessHost.value == this.localUser.chessHost) {
        activeGameUser = this.localUser;
        inactiveGameUser = this.otherUser;
      } else {
        activeGameUser = this.otherUser;
        inactiveGameUser = this.localUser;
      }
      activeGameUser.stepTimer.start();
      activeGameUser.gameTimer.resume();
      inactiveGameUser.stepTimer.stop();
      inactiveGameUser.gameTimer.pause();
    }

    this.chessboard.enabled = this.activeChessHost.value == this.localUser.chessHost;
    this.chessboard.getChessList().forEach((chess) => {
      // 如果当前是本方走，将敌方棋子禁用；否则，全部禁用
      chess.enabled = this.activeChessHost.value == this.localUser.chessHost
        ? this.localUser.chessHost == chess.getHost()
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
        if (chess?.canGoTo(toPos, this.playfield)) {
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
          if (chess.getHost() != this.localUser.chessHost) {
            chess.enabled = true;
          }
        });
      }
      return;
    }

    if (event.chess.selected && event.chess.getHost() == this.localUser.chessHost) {
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
      if (chess?.canGoTo(toPos, this.playfield)) {
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
    if (chess.getHost() != this.localUser.chessHost) {
      return;
    }
    if (this.lastSelected) {
      this.lastSelected.selected = false;
    }
    if (chess.canGoTo(toPos, this.playfield)) {
      const isMove = this.chessboard.isEmpty(toPos.row, toPos.col);
      if (!isMove && this.chessboard.chessAt(toPos)?.getHost() == chess.getHost()) {
        return;
      }
      this.onUserMoveChess(isMove ? 1 : 2, chess.getPos(), toPos, 0);
    }
  }

  private onUserMoveChess(moveType: number, fromPos: ChessPos, toPos: ChessPos, duration?: number) {
    this.playfield.moveChess(fromPos, toPos, this.localUser.chessHost, moveType, duration);
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
    if (this.localUser.isRoomOwner.value) {
      if (this.localUser.readied.value && this.otherUser.readied.value) {
        if (this.otherUser.status.value == UserStatus.AFK) {
          this.context.$q.notify('对方现在是离开状态，不能开始，请等待对方回来');
          return;
        }
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
