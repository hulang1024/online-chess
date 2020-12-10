import APIAccess from 'src/online/api/APIAccess';
import Channel from 'src/online/chat/Channel';
import ChannelManager from 'src/online/chat/ChannelManager';
import GameState from 'src/online/play/GameState';
import PartRoomRequest from 'src/online/room/PartRoomRequest';
import Room from 'src/online/room/Room';
import User from 'src/online/user/User';
import * as user_events from 'src/online/ws/events/user';
import ResponseGameStates, * as game_events from 'src/online/ws/events/play';
import * as spectator_events from 'src/online/ws/events/spectator';
import * as room_events from 'src/online/ws/events/room';
import SocketService from 'src/online/ws/SocketService';
import ChessHost from 'src/rule/chess_host';
import Bindable from 'src/utils/bindables/Bindable';
import BindableBool from 'src/utils/bindables/BindableBool';
import { onBeforeUnmount, onMounted } from '@vue/composition-api';
import Timer from './Timer';
import DrawableChess from './DrawableChess';
import DrawableChessboard from './DrawableChessboard';
import ChessPos from 'src/rule/ChessPos';
import confirm_request from 'src/rule/confirm_request';
import InfoMessage from 'src/online/chat/InfoMessage';

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
  public otherReadied = new BindableBool();
  public otherChessHost = new Bindable<ChessHost>();

  public isWaitingForOther = new Bindable<number>();

  private player: any;

  private gameTimer: Timer;
  private stepTimer: Timer;
  private otherGameTimer: Timer;
  private otherStepTimer: Timer;

  private disconnectHandler: Function;
  private api: APIAccess;
  private socketService: SocketService;
  private channelManager: ChannelManager;
  private chessboard: DrawableChessboard;
  private room: Room;
  private spectatorCount: Bindable<number> = new Bindable<number>(0);
  private lastSelected: DrawableChess | null;

  private confirmDialog: any;
  private resultDialog: any;
  private textOverlay: any;

  private context: any;

  constructor(context: any, room: Room, initialGameStates?: ResponseGameStates) {
    this.context = context;
    this.api = context.api;
    this.channelManager = context.channelManager;
    this.socketService = context.socketService;

    room = room || initialGameStates?.room;
    this.room = room;

    if (!room) {
      // 并不是进入房间，而是刷新网页时
      this.context.$router.push('/');
      return;
    }

    this.gameState.value = this.room.gameStatus;
    this.user = this.api.localUser;
    this.isRoomOwner.value = this.room.owner.id == this.user.id;

    // 初始双方游戏状态和持棋方
    let {
      redChessUser, blackChessUser,
      redReadied, blackReadied,
      redOnline, blackOnline } = this.room;
    if (redChessUser && this.user.id == redChessUser.id) {
      this.online.value = redOnline;
      this.readied.value = redReadied;
      this.chessHost.value = ChessHost.RED;
      this.otherUser.value = blackChessUser;
      this.otherOnline.value = blackOnline;
      this.otherReadied.value = blackReadied;
    }
    if (blackChessUser && this.user.id == blackChessUser.id) {
      this.online.value = blackOnline;
      this.readied.value = blackReadied;
      this.chessHost.value = ChessHost.BLACK;
      this.otherUser.value = redChessUser;
      this.otherOnline.value = redOnline;
      this.otherReadied.value = redReadied;
    }

    this.chessHost.addAndRunOnce((chessHost: ChessHost) => {
      this.otherChessHost.value = ChessHost.reverse(chessHost);
    });

    this.initListeners();

    onMounted(() => {
      const { $refs } = this.context;
      this.player = $refs.player.controller;
      this.player.gameOver.add(this.onGameOver, this);
      this.player.activeChessHost.changed.add(this.onTurnActiveChessHost, this);

      this.chessboard = this.player.chessboard;
      this.chessboard.chessPickupOrDrop.add(this.onChessPickupOrDrop, this);
      this.chessboard.clicked.add(this.onChessboardClick, this);
      this.chessboard.chessMoved.add(this.onInputChessMove, this);
      this.gameState.addAndRunOnce((gameState: GameState) => {
        if (gameState != GameState.PLAYING) {
          // 禁用棋盘
          this.chessboard.enabled = false;
          this.chessboard.getChessList().forEach((chess: DrawableChess) => {
            chess.enabled = false;
          });
          // 当游戏暂停或结束，暂停计时器
          [
            this.gameTimer, this.stepTimer,
            this.otherGameTimer, this.otherStepTimer
          ].forEach(timer => {
            timer?.pause();
          });
        }
      });

      this.confirmDialog = $refs.confirmDialog;
      this.resultDialog = $refs.resultDialog;
      this.textOverlay = $refs.textOverlay;

      this.gameTimer = $refs.gameTimer;
      this.stepTimer = $refs.stepTimer;
      this.otherGameTimer = $refs.otherGameTimer;
      this.otherStepTimer = $refs.otherStepTimer;
      this.gameTimer.setOnEnd(() => this.onTimerEnd(true, true));
      this.stepTimer.setOnEnd(() => this.onTimerEnd(false, true));
      this.otherGameTimer.setOnEnd(() => this.onTimerEnd(true, false));
      this.otherStepTimer.setOnEnd(() => this.onTimerEnd(false, false));
      if (initialGameStates) {
        this.player.startGame(this.chessHost.value, initialGameStates);
      } else {
        const { roomSettings } = this.room;
        this.gameTimer.ready(roomSettings.gameDuration);
        this.otherGameTimer.ready(roomSettings.gameDuration);
        this.stepTimer.ready(roomSettings.stepDuration);
        this.otherStepTimer.ready(roomSettings.stepDuration);
      }

      this.isWaitingForOther.changed.add((value: number) => {
        if (value == 0) {
          this.textOverlay.hide();
          return;
        }
        this.textOverlay.show(({1: '等待玩家准备', 2: '等待玩家加入'} as any)[value]);
      });

      if (this.isRoomOwner.value) {
        this.isWaitingForOther.value = this.otherUser.value ? (this.otherReadied ? 1 : 0) : 2;
      }
    });

    /*
    todo:必须由用户触发
    if ('Notification' in window) {
      setTimeout(() => {
        Notification.requestPermission();
      }, 500);
    }*/

    if (this.gameState.value != GameState.READY) {
      let channel = new Channel();
      channel.id = this.room.channelId;
      this.channelManager.joinChannel(channel);
    }

    onBeforeUnmount(() => {
      this.onQuit();
    });
  }

  private onQuit() {
    [
      room_events.userJoined,
      room_events.userLeft,
      user_events.online,
      user_events.offline,
      game_events.readied,
      game_events.chessPickup,
      game_events.chessMoved,
      game_events.gameStarted,
      game_events.confirmRequest,
      game_events.confirmResponse,
      spectator_events.joined,
      spectator_events.left
    ].forEach(event => {
      event.removeAll();
    });
      
    this.channelManager.leaveChannel(this.room.channelId);
    this.socketService.disconnect.remove(this.disconnectHandler);
  }

  private initListeners() {
    room_events.userJoined.add((msg: room_events.RoomUserJoinedMsg) => {
      window.focus();
      this.otherUser.value = msg.user;
      this.otherOnline.value = true;
      this.otherReadied.value = false;
      this.isWaitingForOther.value = 1;
      this.context.$q.notify(`玩家[${this.otherUser.value.nickname}]已加入棋桌`);
    }, this);

    room_events.userLeft.add((msg: room_events.RoomUserLeftMsg) => {
      if (msg.uid == this.user.id) return;

      this.otherUser.value = null;
      this.otherReadied.value = false;
      this.otherOnline.value = false;
      this.isRoomOwner.value = true;
      if (this.gameState.value != GameState.END) {
        this.gameState.value = GameState.READY;
      }
      this.isWaitingForOther.value = 2;
      this.context.$q.notify('对手已离开棋桌');
      this.context.$q.notify('你成为了房主');
    }, this);

    game_events.readied.add((msg: game_events.GameReadyMsg) => {
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
    }, this);

    game_events.gameStarted.add((msg: game_events.GameStartedMsg) => {
      this.chessHost.value = msg.redChessUid == this.user.id
          ? ChessHost.RED
          : ChessHost.BLACK;
      
      this.lastSelected = null;
      
      this.gameState.value = GameState.PLAYING;

      const { roomSettings } = this.room;
      this.gameTimer.ready(roomSettings.gameDuration);
      this.otherGameTimer.ready(roomSettings.gameDuration);
      this.stepTimer.ready(roomSettings.stepDuration);
      this.otherStepTimer.ready(roomSettings.stepDuration);
      this.player.startGame(this.chessHost.value);
      // 因为activeChessHost一般一直是红方，值相同将不能触发，这里手动触发一次
      this.onTurnActiveChessHost(this.activeChessHost.value);
      this.textOverlay.show(`开始对局`, 1000);
    }, this);
    
    game_events.chessPickup.add((msg: game_events.ChessPickUpMsg) => {
      if (msg.chessHost == this.chessHost.value) {
        return;
      }
      
      window.focus();
      
      this.player.pickChess(msg.pickup, msg.pos, msg.chessHost);
    }, this);

    game_events.chessMoved.add((msg: game_events.ChessMoveMsg) => {
      if (msg.chessHost != this.chessHost.value) {
        window.focus();
      }

      this.canWithdraw.value = true;

      this.player.moveChess(msg.fromPos, msg.toPos, msg.chessHost, msg.moveType == 2);
    }, this);

    game_events.confirmRequest.add((msg: game_events.ConfirmRequestMsg) => {
      // 如果是自己发送的请求
      if (msg.chessHost == this.chessHost.value) {
        return;
      }

      // 对方发送的请求
      // 显示确认对话框
      this.confirmDialog.open({
        yesText: '同意',
        noText: '不同意',
        text: `对方想要${confirm_request.toReadableText(msg.reqType)}`,
        action: (isOk: boolean) => {
          // 发送回应到服务器
          this.socketService.send('play.confirm_response', {reqType: msg.reqType, ok: isOk});
        }
      });
    }, this);

    game_events.confirmResponse.add((msg: game_events.ConfirmResponseMsg) => {
      // 如果同意
      if (!msg.ok) {
        // 对方发送的回应
        if (msg.chessHost != this.chessHost.value) {
          this.textOverlay.show(`对方不同意${confirm_request.toReadableText(msg.reqType)}`, 1000);
        }
        return;
      }

      // 如果不同意
      if (msg.chessHost != this.chessHost.value) {
        this.textOverlay.show(`对方同意${confirm_request.toReadableText(msg.reqType)}`, 1000);
      }

      switch (msg.reqType) {
        case confirm_request.Type.WHITE_FLAG:
          this.onGameOver(msg.chessHost);
          break;
        case confirm_request.Type.DRAW:
          this.onGameOver(null);
          break;
        case confirm_request.Type.WITHDRAW:
          let more = this.player.withdraw();
          this.canWithdraw.value = more;
          break;
        }
    }, this);

    spectator_events.joined.add((msg: spectator_events.SpectatorJoinedMsg) => {
      this.channelManager.openChannel(this.room.channelId);
      this.channelManager.currentChannel.value.addNewMessages(
        new InfoMessage(`${msg.user.nickname} 加入观看`));
      this.spectatorCount.value = msg.spectatorCount;
    }, this);

    spectator_events.left.add((msg: spectator_events.SpectatorLeftMsg) => {
      this.spectatorCount.value = msg.spectatorCount;
    }, this);

    this.socketService.disconnect.add(this.disconnectHandler = () => {
      if ([GameState.READY, GameState.END].includes(this.gameState.value)) {
        this.context.$router.push('/');
        return;
      }

      this.gameState.value = GameState.PAUSE;
      this.online.value = false;
    }, this);

    user_events.offline.add((msg: user_events.UserOfflineMsg) => {
      if (this.gameState.value == GameState.READY ||
        !(this.otherUser.value && this.otherUser.value.id == msg.uid)) {
        return;
      }
      this.otherOnline.value = false;
      this.gameState.value = GameState.PAUSE;
      this.textOverlay.show('对手已下线/掉线，你可以等待对方回来继续');
    });

    user_events.online.add((msg: user_events.UserOnlineMsg) => {
      //判断是否原来就没加入过房间
      if (this.gameState.value == GameState.READY ||
        !(this.otherUser.value && this.otherUser.value.id == msg.uid)) {
        return;
      }
      this.otherOnline.value = true;
      this.textOverlay.show('对手已上线', 3000);
    });

    game_events.gameContinue.add(() => {
      this.online.value = true;
      if (this.online.value && this.otherOnline.value) {
        this.gameState.value = GameState.PLAYING;
      }
      this.socketService.send('play.game_continue', {ok: true});
    });

    game_events.gameStates.add((gameStatesMsg: game_events.GameStatesMsg) => {
      //todo:重连之后同步状态，可能与服务器不一致
      // 之前离线暂停，现在重新激活
      this.onTurnActiveChessHost(this.activeChessHost.value);
    });

    game_events.gameContinueResponse.add((msg: game_events.GameContinueResponseMsg) => {
      this.otherOnline.value = true;
      if (msg.ok) {
        this.gameState.value = GameState.PLAYING;
        if (this.activeChessHost.value == this.chessHost.value) {
          // 如果新旧值相同将不能触发，这里手动触发一次
          this.onTurnActiveChessHost(this.activeChessHost.value);
        }
        this.textOverlay.show('对手已回来', 3000);
      } else {
        this.gameState.value = GameState.END;
        this.otherUser.value = null;
        this.textOverlay.show('对手已选择不继续对局', 2000);
        setTimeout(() => {
          this.isWaitingForOther.value = 1;
        }, 2000);
      }
    });
  }

  private onGameOver(winChessHost: ChessHost | null, isTimeout?: boolean) {
    this.gameState.value = GameState.END;
    [
      this.gameTimer, this.stepTimer,
      this.otherGameTimer, this.otherStepTimer
    ].forEach(timer => {
      timer?.stop();
    });

    let winUserId = winChessHost == null
      ? undefined
      : (winChessHost == this.chessHost.value
        ? this.user.id
        : this.otherUser.value?.id);
    if (this.isRoomOwner.value) {
      this.socketService.send('play.game_over', {winUserId});
      this.otherReadied.value = false;
    }

    this.resultDialog.open({
      result: winChessHost == null ? 0 : winChessHost == this.chessHost.value ? 1 : 2,
      isTimeout,
      action: (option: string) => {
        if (option == 'again') {
          if (this.isRoomOwner.value) {
            this.isWaitingForOther.value = 1;
          } else {
            this.socketService.send('play.ready', {readied: true});
          }
          this.gameState.value = GameState.READY;
        } else {
          this.partRoom();
        }
      }
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
      let winChessHost = isThisUser ? this.otherChessHost.value : this.chessHost.value;
      this.onGameOver(winChessHost, true);
    }
  }

  public onTurnActiveChessHost(activeChessHost: ChessHost) {
    this.activeChessHost.value = activeChessHost;

    if (activeChessHost == this.chessHost.value) {
      this.gameTimer.resume();
      this.stepTimer.restart();
      this.otherGameTimer.pause();
      this.otherStepTimer.pause();
    } else {
      this.gameTimer.pause();
      this.stepTimer.pause();
      this.otherGameTimer.resume();
      this.otherStepTimer.restart();
    }

    this.chessboard.enabled = this.activeChessHost.value == this.chessHost.value;
    this.chessboard.getChessList().forEach(chess => {
      // 如果当前是本方走，将敌方棋子禁用；否则，全部禁用
      chess.enabled = this.activeChessHost.value == this.chessHost.value
        ? this.chessHost.value == chess.getHost()
        : false;
    });
    this.lastSelected = null;
  }

  private onChessboardClick(event: any) {
    if (this.gameState.value != GameState.PLAYING) {
      return;
    }

    if (event.chess == null) {
      // 点击了空白处
      // 并且已经选择了一个棋子
      if (this.lastSelected != null) {
        // 往空白处移动                
        let fromPos = this.lastSelected.getPos();
        let toPos = event.pos;
        let chess = this.chessboard.chessAt(fromPos);
        if (chess?.canGoTo(toPos, this.player)) {
          this.socketService.send('play.chess_move', {
            moveType: 1,
            fromPos,
            toPos
          });
        }
      }
    } else {
      // 点击了一个棋子
      if (this.lastSelected == null) {
        // 并且之前并未选择棋子
        // 现在是选择要走的棋子，只能先选中持棋方棋子
        if (event.chess.getHost() == this.activeChessHost.value) {
          this.lastSelected = event.chess;
          (this.lastSelected as DrawableChess).selected = true;
          this.onChessPickupOrDrop({chess: event.chess, isPickup: true});
          // 将非持棋方的棋子全部启用（这样下次才能点击要吃的目标棋子）
          this.chessboard.getChessList().forEach(chess => {
            if (chess.getHost() != this.chessHost.value) {
              chess.enabled = true;
            }
          });
        }
      } else if (event.chess.selected && event.chess.getHost() == this.chessHost.value) {
        // 重复点击，取消选中
        this.lastSelected.selected = false;
        this.onChessPickupOrDrop({chess: event.chess, isPickup: false});
        this.lastSelected = null;
      } else {
        // 当选择了两个棋子（包括了空棋子），并且两个棋子属于不同棋方，是吃子
        if (event.chess.getHost() != this.activeChessHost.value) {
          let fromPos = this.lastSelected.getPos();
          let toPos = event.pos;
          let chess = this.chessboard.chessAt(fromPos);
          if (chess?.canGoTo(toPos, this.player)) {
            this.socketService.send('play.chess_move', {
              moveType: 2,
              fromPos,
              toPos
            });
          }
        } else {
          // 选中了本方的，取消上个选中
          this.lastSelected.selected = false;
          event.chess.selected = true;
          this.lastSelected = event.chess;
          this.socketService.send('play.chess_pick', {
            pos: this.lastSelected?.getPos(),
            pickup: true
          });
        }
      }
    }
  }

  private onInputChessMove({chess, toPos}: {chess: DrawableChess, toPos: ChessPos}) {
    if (toPos.equals(chess.getPos())) {
      return;
    }
    if (this.lastSelected) {
      this.lastSelected.selected = false;
    }
    if (chess.canGoTo(toPos, this.player)) {
      let isMove = this.chessboard.isEmpty(toPos.row, toPos.col);
      if (!isMove) {
        // 杀自己人可还行
        if (this.chessboard.chessAt(toPos)?.getHost() == chess.getHost()) {
          return;
        }
      }
      this.socketService.send('play.chess_move', {
        moveType: isMove ? 1 : 2,
        fromPos: chess.getPos(),
        toPos
      });
    }
  }

  private onChessPickupOrDrop({chess, isPickup} : {chess: DrawableChess, isPickup: boolean}) {
    this.socketService.send('play.chess_pick', {
      pos: chess.getPos(),
      pickup: isPickup
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
    this.socketService.send('play.confirm_request', {reqType: confirm_request.Type.WHITE_FLAG});
    this.textOverlay.show('已发送认输请求，等待对方回应', 1000);
  }

  public onChessDrawClick() {
    this.socketService.send('play.confirm_request', {reqType: confirm_request.Type.DRAW});
    this.textOverlay.show('已发送和棋请求，等待对方回应', 1000);
  }

  public onWithdrawClick() {
    this.socketService.send('play.confirm_request', {reqType: confirm_request.Type.WITHDRAW});
    this.textOverlay.show('已发送悔棋请求，等待对方回应', 1000);
  }

  public onQuitClick() {
    if ([GameState.READY, GameState.END].includes(this.gameState.value)) {
      this.partRoom();
    } else {
     this.confirmDialog.open({
       yesText: '是',
       noText: '取消',
       text: '你正在游戏中，是否真的离开？',
       action: (ok: boolean) => {
         if (ok) {
           this.gameState.value == GameState.END;
           this.partRoom();
         }
       }
     });
    }
  }

  public partRoom() {
    if (!this.room) {
      this.context.$router.push('/');
      return;
    }
    let partRoomRequest = new PartRoomRequest(this.room);
    partRoomRequest.success = () => {
      this.context.$router.push('/');
    };
    partRoomRequest.failure = () => {
      this.context.$router.push('/');
    };
    this.api.queue(partRoomRequest);
  }
}
