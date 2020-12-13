import { api, channelManager, socketService } from "src/boot/main";
import APIAccess from "src/online/api/APIAccess";
import ChannelManager from "src/online/chat/ChannelManager";
import GameState from "src/online/play/GameState";
import Room from "src/online/room/Room";
import User from "src/online/user/User";
import * as UserEvents from 'src/online/ws/events/user';
import * as GameEvents from 'src/online/ws/events/play';
import * as SpectatorEvents from 'src/online/ws/events/spectator';
import * as RoomEvents from 'src/online/ws/events/room';
import SocketService from "src/online/ws/SocketService";
import ChessHost from "src/rule/chess_host";
import Bindable from "src/utils/bindables/Bindable";
import BindableBool from "src/utils/bindables/BindableBool";
import SpectateResponse from 'src/online/spectator/APISpectateResponse';
import { onBeforeUnmount, onMounted } from "@vue/composition-api";
import ConfirmRequest from "src/rule/confirm_request";
import ChessPos from "src/rule/ChessPos";
import InfoMessage from "src/online/chat/InfoMessage";
import SpectatorLeaveRequest from "src/online/spectator/SpectatorLeaveRequest";
import Signal from "src/utils/signals/Signal";
import Player from "./Player";
import Timer from "./Timer";

export default class Spectate {
  public gameState = new Bindable<GameState>(GameState.READY);

  public activeChessHost = new Bindable<ChessHost | null>();

  public viewChessHost = new Bindable<ChessHost>();

  public redUser = new Bindable<User | null>();

  public redOnline = new BindableBool();

  public redReadied = new BindableBool();

  public blackUser = new Bindable<User | null>();

  public blackOnline = new BindableBool();

  public blackReadied = new BindableBool();

  public otherChessHost = new Bindable<ChessHost>();

  public player: Player;

  public playerLoaded = new Signal();

  private redGameTimer: Timer;

  private redStepTimer: Timer;

  private blackGameTimer: Timer;

  private blackStepTimer: Timer;

  private room: Room;

  private spectatorCount: Bindable<number> = new Bindable<number>(0);

  private targetUserId: number | null;

  private disconnectHandler: () => void;

  private api: APIAccess;

  private socketService: SocketService;

  private channelManager: ChannelManager;

  private textOverlay: any;

  private context: Vue;

  constructor(context: Vue, spectateResponse: SpectateResponse) {
    this.context = context;
    this.api = api;
    this.channelManager = channelManager;
    this.socketService = socketService;

    if (!spectateResponse) {
      this.exitScreen();
      return;
    }

    this.initListeners();

    this.playerLoaded.add(() => {
      this.player.gameOver.add(this.onGameOver.bind(this), this);
      this.player.activeChessHost.changed.add(this.onTurnActiveChessHost.bind(this), this);
      this.gameState.addAndRunOnce(this.onGameStateChanged.bind(this), this);
      if (spectateResponse.states) {
        this.player.startGame(this.viewChessHost.value, spectateResponse.states);
      }
      switch (this.gameState.value) {
        case GameState.READY:
          this.showText('等待对局开始');
          break;
        case GameState.PAUSE:
          this.showText('对局暂停');
          break;
        case GameState.PLAYING:
          break;
        default:
          break;
      }
    });

    onMounted(() => {
      const { $refs } = this.context;

      this.textOverlay = $refs.textOverlay;

      if (this.viewChessHost.value == ChessHost.RED) {
        this.redGameTimer = $refs.viewGameTimer as unknown as Timer;
        this.redStepTimer = $refs.viewStepTimer as unknown as Timer;
        this.blackGameTimer = $refs.otherGameTimer as unknown as Timer;
        this.blackStepTimer = $refs.otherStepTimer as unknown as Timer;
      } else {
        this.redGameTimer = $refs.otherGameTimer as unknown as Timer;
        this.redStepTimer = $refs.otherStepTimer as unknown as Timer;
        this.blackGameTimer = $refs.viewGameTimer as unknown as Timer;
        this.blackStepTimer = $refs.viewStepTimer as unknown as Timer;
      }

      this.redGameTimer.setOnEnd(() => this.onTimerEnd(true, ChessHost.RED));
      this.redStepTimer.setOnEnd(() => this.onTimerEnd(false, ChessHost.RED));
      this.blackGameTimer.setOnEnd(() => this.onTimerEnd(true, ChessHost.BLACK));
      this.blackStepTimer.setOnEnd(() => this.onTimerEnd(false, ChessHost.BLACK));

      const { roomSettings } = this.room;
      this.redGameTimer.setTotalSeconds(roomSettings.gameDuration);
      this.redStepTimer.setTotalSeconds(roomSettings.stepDuration);
      this.blackGameTimer.setTotalSeconds(roomSettings.gameDuration);
      this.blackStepTimer.setTotalSeconds(roomSettings.stepDuration);

      this.loadState(spectateResponse);
    });

    onBeforeUnmount(() => {
      this.onQuit();
    });
  }

  private loadState(spectateResponse: SpectateResponse) {
    const { room } = spectateResponse;
    this.room = room;

    this.gameState.value = room.gameStatus || GameState.READY;

    this.redUser.value = room.redChessUser;
    this.redOnline.value = room.redOnline;
    this.redReadied.value = room.redReadied;
    this.blackUser.value = room.blackChessUser;
    this.blackOnline.value = room.blackOnline;
    this.blackReadied.value = room.blackReadied;

    if (spectateResponse.targetUserId != null) {
      // 如果是观看用户
      if (this.room.redChessUser && this.room.redChessUser.id == spectateResponse.targetUserId) {
        this.viewChessHost.value = ChessHost.RED;
      } else {
        this.viewChessHost.value = ChessHost.BLACK;
      }
    } else {
      this.viewChessHost.value = Math.random() > 0.5 ? ChessHost.BLACK : ChessHost.RED;
    }

    if (spectateResponse.states) {
      const { states: { redTimer, blackTimer } } = spectateResponse;
      this.redGameTimer.ready(redTimer?.gameTime);
      this.redStepTimer.ready(redTimer?.stepTime);
      this.blackGameTimer.ready(blackTimer?.gameTime);
      this.blackStepTimer.ready(blackTimer?.stepTime);
    } else {
      this.redGameTimer.ready();
      this.redStepTimer.ready();
      this.blackGameTimer.ready();
      this.blackStepTimer.ready();
    }
  }

  private initListeners() {
    RoomEvents.userJoined.add((msg: RoomEvents.RoomUserJoinedMsg) => {
      if (this.redUser.value == null) {
        this.redUser.value = msg.user;
        this.redOnline.value = true;
        this.redReadied.value = false;
      } else {
        this.blackUser.value = msg.user;
        this.blackOnline.value = true;
        this.blackReadied.value = false;
      }
      this.context.$q.notify(`${msg.user.nickname} 已加入棋桌`);
    }, this);

    RoomEvents.userLeft.add((msg: RoomEvents.RoomUserLeftMsg) => {
      let leftUser: User | null;

      if (msg.uid == this.targetUserId) {
        this.targetUserId = null;
      }

      if (msg.uid == this.redUser.value?.id) {
        leftUser = this.redUser.value;
        this.redUser.value = null;
        this.redOnline.value = false;
        this.redReadied.value = false;
      } else {
        leftUser = this.blackUser.value;
        this.blackUser.value = null;
        this.blackOnline.value = false;
        this.blackReadied.value = false;
      }

      this.context.$q.notify(`${leftUser?.nickname || '玩家'} 已离开棋桌`);

      if (this.redUser.value == null && this.blackUser.value == null) {
        this.context.$q.notify({ message: '你观看的棋桌已经解散' });
        this.exitScreen();
        return;
      }

      if (this.gameState.value != GameState.END) {
        this.gameState.value = GameState.READY;
      }
      this.activeChessHost.value = null;
    }, this);

    GameEvents.readied.add((msg: GameEvents.GameReadyMsg) => {
      if (msg.uid == this.redUser.value?.id) {
        this.redReadied.value = msg.readied;
      } else {
        this.blackReadied.value = msg.readied;
      }
    }, this);

    GameEvents.gameStarted.add((msg: GameEvents.GameStartedMsg) => {
      // 新对局可能交换棋方，找出新的红方用户和黑方用户
      let redUser: User = this.redUser.value as User;
      let blackUser: User = this.blackUser.value as User;
      [this.redUser.value, this.blackUser.value].forEach((user) => {
        if (user?.id == msg.redChessUid) {
          redUser = user;
        } else {
          blackUser = user as User;
        }
      });
      this.redUser.value = redUser;
      this.blackUser.value = blackUser;

      // 跟随观看目标用户视角
      if (this.targetUserId) {
        this.viewChessHost.value = this.targetUserId == redUser.id
          ? ChessHost.RED : ChessHost.BLACK;
      }

      this.gameState.value = GameState.PLAYING;

      this.redGameTimer.ready();
      this.redStepTimer.ready();
      this.blackGameTimer.ready();
      this.blackStepTimer.ready();
      this.player.startGame(this.viewChessHost.value);
      this.onTurnActiveChessHost(ChessHost.RED);
      this.showText(`开始对局`, 1000);
    }, this);

    GameEvents.gameOver.add((msg: GameEvents.GameOverMsg) => {
      this.onGameOver(msg.winUserId == this.redUser.value?.id ? ChessHost.RED : ChessHost.BLACK);
    });

    GameEvents.chessPickup.add((msg: GameEvents.ChessPickUpMsg) => {
      this.player.pickChess(msg.pickup, ChessPos.make(msg.pos), msg.chessHost);
    }, this);

    GameEvents.chessMoved.add((msg: GameEvents.ChessMoveMsg) => {
      this.player.moveChess(
        ChessPos.make(msg.fromPos),
        ChessPos.make(msg.toPos),
        msg.chessHost, msg.moveType == 2,
      );
    }, this);

    GameEvents.confirmRequest.add((msg: GameEvents.ConfirmRequestMsg) => {
      let text = msg.chessHost == ChessHost.BLACK ? '黑方' : '红方';
      text += `请求${ConfirmRequest.toReadableText(msg.reqType)}`;
      this.showText(text);
    }, this);

    GameEvents.confirmResponse.add((msg: GameEvents.ConfirmResponseMsg) => {
      let text = '';
      text += msg.chessHost == ChessHost.BLACK ? '黑方' : '红方';
      text += msg.ok ? '同意' : '不同意';
      text += ConfirmRequest.toReadableText(msg.reqType);
      this.showText(text, 2000);

      switch (msg.reqType) {
        case ConfirmRequest.Type.WHITE_FLAG:
          this.onGameOver(msg.chessHost);
          break;
        case ConfirmRequest.Type.DRAW:
          this.onGameOver(null);
          break;
        case ConfirmRequest.Type.WITHDRAW: {
          this.player.withdraw();
          break;
        }
        default:
          break;
      }
    }, this);

    SpectatorEvents.joined.add((msg: SpectatorEvents.SpectatorJoinedMsg) => {
      this.channelManager.openChannel(this.room.channelId);
      this.channelManager.currentChannel.value.addNewMessages(
        new InfoMessage(`${msg.user.nickname} 加入观看`),
      );
      this.spectatorCount.value = msg.spectatorCount;
    }, this);

    SpectatorEvents.left.add((msg: SpectatorEvents.SpectatorLeftMsg) => {
      this.spectatorCount.value = msg.spectatorCount;
    }, this);

    this.socketService.disconnect.add(this.disconnectHandler = () => {
      this.exitScreen();
    }, this);

    UserEvents.offline.add((msg: UserEvents.UserOfflineMsg) => {
      if (!(this.blackUser.value && this.blackUser.value.id == msg.uid)) {
        return;
      }
      this.gameState.value = GameState.PAUSE;
      let who: string | null = null;
      if (this.redUser.value && msg.uid == this.redUser.value.id) {
        who = '红方';
        this.redOnline.value = false;
      }
      if (this.blackUser.value && msg.uid == this.blackUser.value.id) {
        who = '黑方';
        this.blackOnline.value = false;
      }
      if (!who) {
        return;
      }
      this.showText(`${who}已下线或掉线，可等待回来继续`);
    });

    UserEvents.online.add((msg: UserEvents.UserOnlineMsg) => {
      if (!(this.blackUser.value && this.blackUser.value.id == msg.uid)) {
        return;
      }
      let who: string | null = null;
      if (this.redUser.value && msg.uid == this.redUser.value.id) {
        who = '红方';
        this.redOnline.value = false;
      }
      if (this.blackUser.value && msg.uid == this.blackUser.value.id) {
        who = '黑方';
        this.blackOnline.value = false;
      }
      if (!who) {
        return;
      }
      this.showText(`${who}已上线`);
    });

    GameEvents.gameContinueResponse.add((msg: GameEvents.GameContinueResponseMsg) => {
      let who = '玩家';
      if (this.redUser.value && msg.uid == this.redUser.value.id) {
        who = '红方';
        this.redOnline.value = false;
      }
      if (this.blackUser.value && msg.uid == this.blackUser.value.id) {
        who = '黑方';
        this.blackOnline.value = false;
      }
      if (msg.ok) {
        this.showText(`${who}已回来`, 2000);
      } else {
        this.showText(`${who}已选择不继续对局`);
      }
      if (this.redOnline.value && this.blackOnline.value) {
        this.gameState.value = GameState.PLAYING;
      }
    });
  }

  private onGameStateChanged(gameState: GameState) {
    if (gameState == GameState.PLAYING) {
      return;
    }
    // 当游戏暂停或结束，暂停计时器
    [
      this.redGameTimer, this.redStepTimer,
      this.blackGameTimer, this.blackStepTimer,
    ].forEach((timer) => {
      timer.pause();
    });
  }

  public onTimerEnd(isGameTimer: boolean, chessHost: ChessHost) {
    if (isGameTimer) {
      // 如果局时用完，步时计时器用作读秒计数器
      const { roomSettings } = this.room;
      if (chessHost == ChessHost.RED) {
        this.redStepTimer.setTotalSeconds(roomSettings.secondsCountdown);
      } else {
        this.blackStepTimer.setTotalSeconds(roomSettings.secondsCountdown);
      }
    }
  }

  private onTurnActiveChessHost(activeChessHost: ChessHost) {
    if (this.gameState.value != GameState.PLAYING) {
      return;
    }
    this.activeChessHost.value = activeChessHost;

    if (activeChessHost == ChessHost.BLACK) {
      this.redGameTimer.pause();
      this.redStepTimer.pause();
      this.blackGameTimer.resume();
      this.blackStepTimer.start();
    } else {
      this.redGameTimer.resume();
      this.redStepTimer.start();
      this.blackGameTimer.pause();
      this.blackStepTimer.pause();
    }
  }

  private onGameOver(winChessHost: ChessHost | null) {
    this.gameState.value = GameState.END;
    this.showText(winChessHost == null
      ? '平局'
      : `${winChessHost == ChessHost.RED ? '红方' : '黑方'}赢！`);
  }

  public onQuitClick() {
    this.api.perform(new SpectatorLeaveRequest(this.room));
    this.onQuit();
    this.exitScreen();
  }

  public onToggleViewClick() {
    this.swapTimerTime();
    this.viewChessHost.value = ChessHost.reverse(this.viewChessHost.value);
    this.player.reverseChessLayoutView();
  }

  private swapTimerTime() {
    const { $refs } = this.context;

    if (this.gameState.value == GameState.PLAYING) {
      if (this.activeChessHost.value == ChessHost.RED) {
        this.redGameTimer.pause();
        this.redStepTimer.pause();
      } else {
        this.blackGameTimer.pause();
        this.blackStepTimer.pause();
      }
    }

    // 交换时间
    const t1 = this.redGameTimer.getCurrent();
    this.redGameTimer.setCurrent(this.blackGameTimer.getCurrent());
    this.blackGameTimer.setCurrent(t1);
    const t2 = this.redStepTimer.getCurrent();
    this.redStepTimer.setCurrent(this.blackStepTimer.getCurrent());
    this.blackStepTimer.setCurrent(t2);

    // 重新设置引用
    if (this.viewChessHost.value == ChessHost.RED) {
      this.redGameTimer = $refs.otherGameTimer as unknown as Timer;
      this.redStepTimer = $refs.otherStepTimer as unknown as Timer;
      this.blackGameTimer = $refs.viewGameTimer as unknown as Timer;
      this.blackStepTimer = $refs.viewStepTimer as unknown as Timer;
    } else {
      this.redGameTimer = $refs.viewGameTimer as unknown as Timer;
      this.redStepTimer = $refs.viewStepTimer as unknown as Timer;
      this.blackGameTimer = $refs.otherGameTimer as unknown as Timer;
      this.blackStepTimer = $refs.otherStepTimer as unknown as Timer;
    }

    // 恢复之前的状态
    if (this.gameState.value == GameState.PLAYING) {
      if (this.activeChessHost.value == ChessHost.RED) {
        this.redGameTimer.resume();
        this.redStepTimer.resume();
      } else {
        this.blackGameTimer.resume();
        this.blackStepTimer.resume();
      }
    }
  }

  private onQuit() {
    [
      RoomEvents.userJoined,
      RoomEvents.userLeft,
      UserEvents.online,
      UserEvents.offline,
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

    this.channelManager.leaveChannel(this.room.channelId);
    this.socketService.disconnect.remove(this.disconnectHandler);
  }

  private exitScreen() {
    // eslint-disable-next-line
    this.context.$router.push('/');
  }

  private showText(text: string, duration?: number) {
    // eslint-disable-next-line
    this.textOverlay.show(text, duration);
  }
}
