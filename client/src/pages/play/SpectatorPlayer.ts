// import { api, channelManager, socketService } from "src/boot/main";
import APIAccess from "src/online/api/APIAccess";
import ChannelManager from "src/online/chat/ChannelManager";
import GameState from "src/online/play/GameState";
import Room from "src/online/room/Room";
// import * as GameEvents from 'src/online/ws/events/play';
// import * as SpectatorEvents from 'src/online/ws/events/spectator';
// import * as RoomEvents from 'src/online/ws/events/room';
import SocketService from "src/online/ws/SocketService";
import ChessHost from "src/rule/chess_host";
import Bindable from "src/utils/bindables/Bindable";
// import SpectateResponse from 'src/online/spectator/APISpectateResponse';
// import { onBeforeUnmount, onMounted } from "@vue/composition-api";
// import ConfirmRequest from "src/rule/confirm_request";
// import ChessPos from "src/rule/ChessPos";
// import SpectatorLeaveRequest from "src/online/spectator/SpectatorLeaveRequest";
import Signal from "src/utils/signals/Signal";
import Playfield from "./Playfield";

export default class Spectator {
  public gameState = new Bindable<GameState>(GameState.READY);

  public activeChessHost = new Bindable<ChessHost | null>();

  public otherChessHost = new Bindable<ChessHost>();

  public spectatorCount = new Bindable<number>(0);

  public playfield: Playfield;

  public playfieldLoaded = new Signal();

  private room: Room;

  private targetUserId: number | null;

  private disconnectHandler: () => void;

  private api: APIAccess;

  private socketService: SocketService;

  private channelManager: ChannelManager;

  private textOverlay: any;

  private context: Vue;
/*
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

    this.playfieldLoaded.add(() => {
      switch (this.gameState.value) {
        case GameState.READY:
          this.showText('你正在旁观中，请等待游戏开始');
          break;
        case GameState.PAUSE:
          this.showText('你正在旁观中，游戏暂停，请等待游戏继续');
          break;
        case GameState.PLAYING:
          this.showText('你正在旁观中', 3000);
          break;
        case GameState.END:
          this.showText('你正在旁观中，对局已经结束，请等待新对局开始');
          break;
        default:
          break;
      }
    });

    onMounted(() => {
      const { $refs } = this.context;

      this.textOverlay = $refs.textOverlay;

      if (spectateResponse.targetUserId != null) {
        // 如果是观看用户
        this.targetUserId = spectateResponse.targetUserId;
        if (this.room.redChessUser && this.room.redChessUser.id == spectateResponse.targetUserId) {
          this.viewChessHost.value = ChessHost.RED;
        } else {
          this.viewChessHost.value = ChessHost.BLACK;
        }
      } else {
        this.viewChessHost.value = Math.random() > 0.5 ? ChessHost.BLACK : ChessHost.RED;
      }

      this.initTimers(spectateResponse);

      this.gameState.addAndRunOnce(this.onGameStateChanged, this);
    });

    onBeforeUnmount(() => {
      this.onQuit();
    });
  }

  private initListeners() {
    RoomEvents.userLeft.add(this.onRoomUserLeftEvent, this);

    GameEvents.readied.add((msg: GameEvents.GameReadyMsg) => {
      if (msg.uid == this.redUser.value?.id) {
        this.redReadied.value = msg.readied;
      } else {
        this.blackReadied.value = msg.readied;
      }
    }, this);

    GameEvents.gameStarted.add(this.onGameStartedEvent, this);

    GameEvents.gameOver.add((msg: GameEvents.GameOverMsg) => {
      this.onGameOver(msg.winUserId == this.redUser.value?.id ? ChessHost.RED : ChessHost.BLACK);
    });

    GameEvents.chessPickup.add((msg: GameEvents.ChessPickUpMsg) => {
      this.playfield.pickChess(msg.pickup, ChessPos.make(msg.pos), msg.chessHost);
    }, this);

    GameEvents.chessMoved.add((msg: GameEvents.ChessMoveMsg) => {
      this.playfield.moveChess(
        ChessPos.make(msg.fromPos),
        ChessPos.make(msg.toPos),
        msg.chessHost, msg.moveType,
      );
    }, this);

    GameEvents.confirmRequest.add(this.onGameConfirmRequestEvent, this);
    GameEvents.confirmResponse.add(this.onGameConfirmResponseEvent, this);
    GameEvents.gameContinueResponse.add(this.onGameContinueResponseEvent, this);

    SpectatorEvents.joined.add((msg: SpectatorEvents.SpectatorJoinedMsg) => {
      this.spectatorCount.value = msg.spectatorCount;
    }, this);

    SpectatorEvents.left.add((msg: SpectatorEvents.SpectatorLeftMsg) => {
      this.spectatorCount.value = msg.spectatorCount;
    }, this);

    this.socketService.disconnect.add(this.disconnectHandler = () => {
      this.exitScreen();
    }, this);

    api.state.changed.addOnce((state: APIState) => {
      if (state == APIState.offline) {
        this.exitScreen();
      }
    });
  }

  private onGameConfirmRequestEvent(msg: GameEvents.ConfirmRequestMsg) {
    let text = msg.chessHost == ChessHost.BLACK ? '黑方' : '红方';
    text += `请求${ConfirmRequest.toReadableText(msg.reqType)}`;
    this.showText(text);
  }

  private onGameOver(winChessHost: ChessHost | null) {
    this.gameState.value = GameState.END;
    this.showText(winChessHost == null
      ? '平局'
      : `${winChessHost == ChessHost.RED ? '红方' : '黑方'}赢！`);
  }

  private onRoomUserLeftEvent(msg: RoomEvents.RoomUserLeftMsg) {
    if (msg.uid == this.targetUserId) {
      this.targetUserId = null;
    }
    if (this.redUser.value == null && this.blackUser.value == null) {
      this.context.$q.notify({ message: '你观看的棋桌已经解散' });
      this.exitScreen();
    }
  }

  public onQuitClick() {
    this.api.perform(new SpectatorLeaveRequest(this.room));
    this.onQuit();
    this.exitScreen();
  }

  public onInviteClick() {
    // eslint-disable-next-line
    (this.context.$vnode.context?.$refs.toolbar as any).toggle('socialBrowser');
  }

  public onToggleViewClick() {
    this.viewChessHost.value = ChessHost.reverse(this.viewChessHost.value);
    this.swapTimers();
    this.playfield.reverseChessLayoutView();
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

    RoomEvents.userLeft.remove(this.onRoomUserLeftEvent, this);
    this.socketService.disconnect.remove(this.disconnectHandler);

    this.channelManager.leaveChannel(this.room.channelId);
  }

  private exitScreen() {
    // eslint-disable-next-line
    this.context.$router.push('/');
  }

  private showText(text: string, duration?: number) {
    // eslint-disable-next-line
    this.textOverlay.show(text, duration);
  }
  */
}
