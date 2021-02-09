import APIAccess, { APIState } from 'src/online/api/APIAccess';
import Channel from 'src/online/chat/Channel';
import ChannelType from 'src/online/chat/ChannelType';
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
import ChessHost from 'src/rulesets/chinesechess/chess_host';
import Bindable from 'src/utils/bindables/Bindable';
import BindableBool from 'src/utils/bindables/BindableBool';
import { onBeforeUnmount, onMounted } from '@vue/composition-api';
import ChessPos from 'src/rulesets/chinesechess/ChessPos';
import { api, channelManager, socketService } from 'src/boot/main';
import ConfirmRequest from 'src/rulesets/chinesechess/confirm_request';
import UserStatus from 'src/user/UserStatus';
import User from 'src/user/User';
import ChessAction from 'src/rulesets/chinesechess/ChessAction';
import Timer from './timer/Timer';
import DrawableChess from '../../rulesets/chinesechess/ui/DrawableChess';
import DrawableChessboard from '../../rulesets/chinesechess/ui/DrawableChessboard';
import Playfield from '../../rulesets/chinesechess/ui/Playfield';
import CircleTimer from './timer/CircleTimer';
import GameUser from './GameUser';
import GameAudio from './GameAudio';
import GameRule from '../../rulesets/chinesechess/ui/GameRule';
import UserPlayInput from '../../rulesets/chinesechess/ui/UserPlayInput';

export default class Player {
  public gameState = new Bindable<GameState>(GameState.READY);

  public gameRule = new GameRule();

  private userPlayInput: UserPlayInput;

  public localUser = new GameUser();

  public otherUser = new GameUser();

  public spectatorCount = new Bindable<number>(0);

  private disconnectHandler: () => void;

  protected api: APIAccess = api;

  private socketService: SocketService = socketService;

  private channelManager: ChannelManager = channelManager;

  protected playfield: Playfield;

  private chessboard: DrawableChessboard;

  protected room: Room;

  public isWatchingMode = false;

  public reverse = new BindableBool();

  private resultDialog: any;

  protected textOverlay: any;

  protected context: Vue;

  constructor(
    context: Vue,
    room: Room,
    isWatchingMode: boolean,
    initialGameStates?: ResponseGameStates | undefined,
  ) {
    this.context = context;
    this.isWatchingMode = isWatchingMode;

    if (!(room || initialGameStates?.room)) {
      // 并不是进入房间，而是刷新网页时
      this.exitScreen();
      return;
    }

    this.localUser.bindable.value = api.localUser;
    this.room = room || initialGameStates?.room as Room;

    this.initListeners();

    const playfield = new Playfield(context);
    this.playfield = playfield;
    playfield.loaded.add(() => {
      this.chessboard = playfield.chessboard as unknown as DrawableChessboard;
      this.gameRule.setPlayfield(playfield);

      if (!this.isWatchingMode) {
        this.chessboard.chessPosClicked.add(() => {
          if (this.gameState.value == GameState.PLAYING
              && this.localUser.chessHost != this.gameRule.activeChessHost.value) {
            const playerView = this.context.$refs.playerView as Vue;
            // eslint-disable-next-line
            (playerView.$refs.otherGameUserPanel as any).blink();
          }
        });
        this.userPlayInput = new UserPlayInput(
          this.gameRule,
          this.gameState,
          this.localUser.chessHostBindable,
        );
        this.userPlayInput.inputDone.add(() => {
          this.localUser.stepTimer.pause();
          this.localUser.gameTimer.pause();
        });
      }

      this.gameRule.onGameOver = (winChessHost: ChessHost) => {
        if (this.isWatchingMode) {
          return;
        }
        if (winChessHost != this.localUser.chessHost) {
          return;
        }
        const winner = this.localUser.chessHost == winChessHost ? this.localUser : this.otherUser;
        setTimeout(() => {
          this.socketService.send('play.game_over', { winUserId: winner.id });
        }, 0);
      };

      this.gameRule.activeChessHost.changed.add(
        (v: ChessHost) => this.onTurnActiveChessHost(v, false), this,
      );
    });

    onMounted(() => {
      const playerView = this.context.$refs.playerView as Vue;

      this.resultDialog = playerView.$refs.resultDialog;
      this.textOverlay = playerView.$refs.textOverlay;

      this.initTimers();
      this.loadState(initialGameStates);

      this.localUser.chessHostBindable.addAndRunOnce((chessHost: ChessHost) => {
        this.otherUser.chessHostBindable.value = ChessHost.reverse(chessHost);
      });

      let channel = new Channel();
      channel.name = '#当前房间';
      channel.id = this.room.channelId;
      channel.type = ChannelType.ROOM;
      channel = this.channelManager.joinChannel(channel);
      channel.lastReadId = initialGameStates ? null : channel.lastMessageId;
      // eslint-disable-next-line
      (playerView.$refs.chatPanel as any)?.loadChannel(channel);

      if (this.gameState.value == GameState.PAUSE) {
        this.showText('对局暂停中，等待对手回来继续');
      }

      if (initialGameStates) {
        this.gameRule.start(this.localUser.chessHost, initialGameStates);
      }

      this.gameState.addAndRunOnce(this.onGameStateChanged, this);
    });

    onBeforeUnmount(() => {
      this.onQuit();
    });
  }

  private loadState(states?: ResponseGameStates | undefined, isReload = false) {
    if (!isReload) {
      this.gameState.value = this.room.gameStatus || GameState.READY;
    }

    // 初始双方对局状态和持棋方
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
      if (!isReload) {
        gameUser.bindable.value = data[`${keyP}ChessUser`] as User;
      }
      gameUser.online.value = data[`${keyP}Online`] as boolean;
      gameUser.status.value = data[`${keyP}UserStatus`] as number;
      gameUser.readied.value = data[`${keyP}Readied`] as boolean;
      gameUser.isRoomOwner.value = gameUser.id == this.room.owner.id;

      if (!isReload) {
        const { roomSettings } = this.room;
        const { gameTimer, stepTimer } = gameUser;
        gameTimer.setTotalSeconds(roomSettings.gameDuration);
        stepTimer.setTotalSeconds(roomSettings.stepDuration);
        if (states) {
          const timerState = {
            red: states.redTimer,
            black: states?.blackTimer,
          }[keyP];
          gameTimer.ready(timerState.gameTime);
          stepTimer.ready(timerState.stepTime);
        } else {
          gameTimer.ready();
          stepTimer.ready();
        }
      }
    };

    setGameUser(this.localUser);
    setGameUser(this.otherUser);

    this.spectatorCount.value = this.room.spectatorCount;
  }

  private initTimers() {
    const playerView = this.context.$refs.playerView as Vue;
    const viewGameUserPanelRefs = (playerView.$refs.viewGameUserPanel as Vue).$refs;
    const otherGameUserPanelRefs = (playerView.$refs.otherGameUserPanel as Vue).$refs;
    this.localUser.gameTimer = viewGameUserPanelRefs.gameTimer as unknown as Timer;
    (this.localUser.gameTimer as unknown as Vue).$on('ended', () => {
      if (this.isWatchingMode) {
        return;
      }
      // 如果局时用完，步时计时器用作读秒计数器
      this.localUser.stepTimer.setTotalSeconds(this.room.roomSettings.secondsCountdown);
    });
    this.localUser.stepTimer = viewGameUserPanelRefs.stepTimer as unknown as Timer;
    (this.localUser.stepTimer as unknown as Vue).$on('ended', () => {
      if (this.isWatchingMode) {
        return;
      }
      this.userPlayInput.disable();
      // 如果步时/读秒时间用完
      this.socketService.send('play.game_over', { winUserId: this.otherUser.id, timeout: true });
    });
    this.localUser.stepTimer.setSoundEnabled(true);

    this.otherUser.gameTimer = otherGameUserPanelRefs.gameTimer as unknown as Timer;
    this.otherUser.stepTimer = otherGameUserPanelRefs.stepTimer as unknown as Timer;
    this.otherUser.stepTimer.setSoundEnabled(this.isWatchingMode);

    (viewGameUserPanelRefs.circleStepTimer as unknown as CircleTimer)
      .setSyncTimer(this.localUser.stepTimer);
    (otherGameUserPanelRefs.circleStepTimer as unknown as CircleTimer)
      .setSyncTimer(this.otherUser.stepTimer);
  }

  private initListeners() {
    RoomEvents.userJoined.add(this.onRoomUserJoinedEvent, this);
    RoomEvents.userLeft.add(this.onRoomUserLeftEvent, this);

    UserEvents.offline.add(this.onUserOfflineEvent, this);
    UserEvents.online.add(this.onUserOnlineEvent, this);
    UserEvents.statusChanged.add(this.onUserStatusChangedEvent, this);

    GameEvents.readied.add(this.onGameReadyEvent, this);
    GameEvents.gameStarted.add(this.onGameStartedEvent, this);
    GameEvents.gamePause.add(this.onGamePauseEvent, this);
    GameEvents.gameResume.add(this.onGameResumeEvent, this);
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
      if (this.isWatchingMode) {
        this.exitScreen();
        return;
      }
      if ([GameState.READY, GameState.END].includes(this.gameState.value)) {
        this.exitScreen();
        return;
      }

      this.gameState.value = GameState.PAUSE;
      this.localUser.online.value = false;
      this.room.offlineAt = new Date().toString();
    }, this);

    api.state.changed.addOnce((state: APIState) => {
      if (state == APIState.offline) {
        this.exitScreen();
      }
    });

    const onPopState = () => {
      if ([GameState.READY, GameState.END].includes(this.gameState.value)) {
        this.partRoom();
      } else {
        // 不知道怎么阻止浏览器后退按键事件导致后退，简单重载
        window.location.reload();
      }
      window.removeEventListener('popstate', onPopState);
    };
    window.addEventListener('popstate', onPopState);
  }

  private onQuit() {
    [
      GameEvents.chessPickup,
      GameEvents.chessMoved,
      GameEvents.chessWithdraw,
      GameEvents.readied,
      GameEvents.gameStarted,
      GameEvents.gameStates,
      GameEvents.gamePause,
      GameEvents.gameResume,
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

  protected onGameReadyEvent(msg: GameEvents.GameReadyMsg) {
    const gameUser = this.getGameUserByUserId(msg.uid) as GameUser;
    gameUser.readied.value = msg.readied;
    if (gameUser != this.localUser) {
      GameAudio.play(`room/${msg.readied ? 'readied' : 'unready'}`);
    }
  }

  private onGameStartedEvent(msg: GameEvents.GameStartedMsg) {
    const redGameUser = this.getGameUserByUserId(msg.redChessUid) as GameUser;
    const blackGameUser = this.getGameUserByUserId(msg.blackChessUid) as GameUser;
    this.gameRule.activeChessHost.value = null;
    redGameUser.chessHostBindable.value = ChessHost.RED;
    blackGameUser.chessHostBindable.value = ChessHost.BLACK;

    this.gameState.value = GameState.PLAYING;

    const { roomSettings: { gameDuration, stepDuration } } = this.room;

    [redGameUser, blackGameUser].forEach(({ gameTimer, stepTimer }) => {
      gameTimer.setTotalSeconds(gameDuration);
      stepTimer.setTotalSeconds(stepDuration);
      gameTimer.ready();
      stepTimer.ready();
    });

    GameAudio.play('gameplay/started');
    this.showText(`开始对局`, 1000);

    this.gameRule.start(this.localUser.chessHost);
    // 因为activeChessHost一般一直是红方，值相同将不能触发，这里手动触发一次
    this.onTurnActiveChessHost(ChessHost.RED);
  }

  private onGamePauseEvent() {
    this.gameState.value = GameState.PAUSE;
    if (!this.isWatchingMode) {
      this.chessboard.hide();
    }
    this.showText('对局暂停');
  }

  private onGameResumeEvent() {
    this.gameState.value = GameState.PLAYING;
    if (!this.isWatchingMode) {
      this.chessboard.show();
    }
  }

  protected onGameOverEvent(msg: GameEvents.GameOverMsg) {
    this.gameState.value = GameState.END;

    if (this.localUser.isRoomOwner.value) {
      this.otherUser.readied.value = false;
    }

    this.gameRule.activeChessHost.value = null;

    const loser = this.localUser.id == msg.winUserId ? this.otherUser : this.localUser;
    if (msg.timeout) {
      loser.stepTimer.setCurrent(0);
    }

    const result = msg.winUserId ? (this.localUser.id == msg.winUserId ? 1 : 2) : 0;

    if (this.isWatchingMode) {
      return;
    }

    this.exitActiveOverlays();
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
    this.chessboard.getChessList().forEach((chess: DrawableChess) => {
      if (chess.selected && chess.getHost() == msg.chessHost) {
        chess.selected = false;
      }
    });

    const pos = ChessPos.make(msg.pos).convertViewPos(msg.chessHost, this.gameRule.viewChessHost);
    const chess = this.chessboard.chessAt(pos) as DrawableChess;
    chess.selected = msg.pickup;
  }

  private onGameChessMovedEvent(msg: GameEvents.ChessMoveMsg) {
    const action = new ChessAction();
    action.fromPos = ChessPos.make(msg.fromPos);
    action.toPos = ChessPos.make(msg.toPos);
    action.chessHost = msg.chessHost;
    this.gameRule.onChessAction(action);
  }

  private onGameChessWithdrawEvent() {
    this.gameRule.withdraw();
  }

  protected onGameConfirmRequestEvent(msg: GameEvents.ConfirmRequestMsg) {
    if (this.isWatchingMode) {
      return;
    }
    // 对方发送的请求
    const onAction = (isOk: boolean) => {
      this.socketService.send('play.confirm_response', { reqType: msg.reqType, ok: isOk });
    };
    // 显示确认对话框
    this.exitActiveOverlays();
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

  protected onGameConfirmResponseEvent(msg: GameEvents.ConfirmResponseMsg) {
    const title = this.isWatchingMode ? (ChessHost.BLACK ? '黑方' : '红方') : '对方';
    if (!msg.ok) {
      this.showText(`${title}不同意${ConfirmRequest.toReadableText(msg.reqType)}`, 1000);
    }
  }

  private onGameContinueEvent() {
    this.localUser.online.value = true;
    this.socketService.send('play.game_continue', { ok: true });
    GameEvents.gameStates.addOnce((msg: GameEvents.GameStatesMsg) => {
      this.room = msg.states.room as Room;
      this.loadState(msg.states, true);
      if (msg.states.room?.gameStatus == GameState.PLAYING) {
        this.gameState.value = GameState.PLAYING;
      }
    });
  }

  private onGameContinueResponseEvent(msg: GameEvents.GameContinueResponseMsg) {
    if (msg.ok) {
      this.gameState.value = GameState.PLAYING;
      this.room.offlineAt = null;
      this.chessboard.show();
      this.showText('对手已回来，对局继续', 3000);
    } else {
      this.gameState.value = GameState.READY;
      this.otherUser.bindable.value = null;
      this.showText('对手已选择不继续对局', 2000);
    }
  }

  private onRoomUserJoinedEvent(msg: RoomEvents.RoomUserJoinedMsg) {
    // 旁观模式时，localUser可能为空
    const gameUser = this.localUser.id
      ? msg.user.id == this.localUser.id
        ? this.localUser
        : this.otherUser
      : this.localUser;

    gameUser.bindable.value = msg.user;
    gameUser.online.value = true;
    gameUser.status.value = UserStatus.ONLINE;
    gameUser.readied.value = false;

    GameAudio.play('room/user_join');
  }

  private onRoomUserLeftEvent(msg: RoomEvents.RoomUserLeftMsg) {
    if (this.gameState.value == GameState.PAUSE && !this.room.offlineAt) {
      this.chessboard.show();
      // eslint-disable-next-line
      this.textOverlay.hide();      
    }
    this.gameState.value = GameState.READY;

    const gameUser = msg.uid == this.localUser.id
      ? this.localUser
      : this.otherUser;
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

    this.gameRule.activeChessHost.value = null;

    GameAudio.play('room/user_left');

    if (!this.localUser.isRoomOwner.value) {
      this.localUser.isRoomOwner.value = true;
      this.otherUser.isRoomOwner.value = false;
      if (!this.isWatchingMode) {
        this.context.$q.notify('你成为了房主');
      }
    }

    if (this.isWatchingMode && (this.localUser.id == null && this.otherUser.id == null)) {
      this.context.$q.notify({ message: '你观看的棋桌已经解散' });
      this.exitScreen();
    }
  }

  private onUserOfflineEvent(msg: UserEvents.UserOfflineMsg) {
    const gameUser = this.getGameUserByUserId(msg.uid);
    if (!gameUser) {
      return;
    }
    this.room.offlineAt = new Date().toString();
    gameUser.online.value = false;
    gameUser.status.value = UserStatus.OFFLINE;
    this.gameState.value = GameState.PAUSE;
    this.showText(`对方已下线/掉线，你可以等待对方回来继续`);
  }

  private onUserOnlineEvent(msg: UserEvents.UserOnlineMsg) {
    const gameUser = this.getGameUserByUserId(msg.uid);
    if (!gameUser) {
      return;
    }
    gameUser.online.value = true;
    gameUser.status.value = UserStatus.ONLINE;
    this.context.$q.notify(`${msg.nickname}已上线`);
  }

  private onUserStatusChangedEvent(msg: UserEvents.UserStatusChangedMsg) {
    const gameUser = this.getGameUserByUserId(msg.uid);
    if (!gameUser) {
      return;
    }
    gameUser.status.value = msg.status;
  }

  protected getGameUserByUserId(id: number): GameUser | null {
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
          if (this.gameRule.activeChessHost.value == this.localUser.chessHost) {
            activeGameUser = this.localUser;
            if (this.userPlayInput) {
              // 禁用过，现在应启用输入
              this.userPlayInput.enable();
            }
          } else {
            activeGameUser = this.otherUser;
          }
          activeGameUser.gameTimer.resume();
          activeGameUser.stepTimer.resume();
          this.showText('对局继续', 1000);
        }
        break;
      }
      case GameState.READY:
      case GameState.PAUSE:
      case GameState.END: {
        // 当对局暂停或结束，暂停计时器
        [
          this.localUser.gameTimer, this.localUser.stepTimer,
          this.otherUser.gameTimer, this.otherUser.stepTimer,
        ].filter(Boolean).forEach((timer) => {
          timer.pause();
        });
        break;
      }
      default:
        break;
    }
  }

  private onTurnActiveChessHost(activeChessHost: ChessHost, isGameResume = false) {
    this.gameRule.activeChessHost.value = activeChessHost;

    if (this.gameState.value != GameState.PLAYING) {
      return;
    }

    if (!isGameResume) {
      let activeGameUser: GameUser;
      let inactiveGameUser: GameUser;
      if (activeChessHost == this.localUser.chessHost) {
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

    if (this.userPlayInput) {
      if (activeChessHost == this.localUser.chessHost) {
        this.userPlayInput.enable();
      } else {
        this.userPlayInput.disable();
      }
    }
  }

  public onReadyStartClick() {
    if (this.localUser.isRoomOwner.value) {
      if (this.otherUser.id && this.otherUser.readied.value) {
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

  public onPauseOrResumeGameClick() {
    if (this.room.offlineAt) {
      this.context.$q.notify('游戏已离线暂停状态，不能操作');
      return;
    }
    if (this.localUser.isRoomOwner.value) {
      if (this.gameState.value == GameState.PAUSE
        && this.otherUser.status.value == UserStatus.AFK) {
        this.context.$q.notify('对方现在是离开状态，请等待对方回来');
        return;
      }
      const action = this.gameState.value == GameState.PLAYING ? 'pause' : 'resume';
      this.socketService.send(`play.${action}_game`);
    } else {
      this.socketService.send('play.confirm_request', {
        reqType: this.gameState.value == GameState.PLAYING
          ? ConfirmRequest.Type.PAUSE_GAME
          : ConfirmRequest.Type.RESUME_GAME,
      });
      this.showText('已发送请求，等待对方回应', 1000);
    }
  }

  public onToggleViewClick() {
    this.reverse.toggle();
    this.gameRule.reverseChessLayoutView();
  }

  public onQuitClick() {
    if ([GameState.READY, GameState.END].includes(this.gameState.value)) {
      this.partRoom();
    } else {
      let label = '离开';
      let text = '是否真的离开？';
      if (this.gameState.value == GameState.PLAYING) {
        text = '对局进行中，是否真的离开？';
      }
      if (this.gameState.value == GameState.PAUSE) {
        if (this.room.offlineAt) {
          text = '对局暂停中，是否解散棋局？<br>(你也可以退出登录，棋局将保留3小时)';
          label = '解散棋局';
        } else {
          text = '对局暂停中，是否真的离开？';
        }
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
          label,
          color: 'negative',
        },
      }).onCancel(() => {
        this.gameState.value = GameState.END;
        this.partRoom();
      });
    }
  }

  protected showText(text: string, duration?: number) {
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

  protected exitScreen() {
    // eslint-disable-next-line
    this.context.$router.replace('/');
  }

  protected exitActiveOverlays() {
    // eslint-disable-next-line
    (this.context.$vnode.context?.$refs.toolbar as any).exitActive();
  }
}
