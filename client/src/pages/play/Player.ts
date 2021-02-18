import APIAccess, { APIState } from 'src/online/api/APIAccess';
import Channel from 'src/online/chat/Channel';
import ChannelType from 'src/online/chat/ChannelType';
import ChannelManager from 'src/online/chat/ChannelManager';
import GameState from 'src/online/play/GameState';
import PartRoomRequest from 'src/online/room/PartRoomRequest';
import Room from 'src/online/room/Room';
import * as GameplayMsgs from 'src/online/play/gameplay_server_messages';
import ResponseGameStates from 'src/online/play/game_states_response';
import BindableBool from 'src/utils/bindables/BindableBool';
import { onBeforeUnmount, onMounted } from '@vue/composition-api';
import { api, channelManager } from 'src/boot/main';
import UserStatus from 'src/user/UserStatus';
import User from 'src/user/User';
import ChessHost from 'src/rulesets/chinesechess/chess_host';
import DrawableChessboard from 'src/rulesets/chinesechess/ui/DrawableChessboard';
import Playfield from 'src/rulesets/chinesechess/ui/Playfield';
import GameRule from 'src/rulesets/chinesechess/ui/GameRule';
import UserPlayInput from 'src/rulesets/chinesechess/ui/UserPlayInput';
import OnlineRulesetPlay from 'src/rulesets/chinesechess/ui/OnlineRulesetPlay';
import GameplayClient from 'src/online/play/GameplayClient';
import GameplayServer from 'src/online/play/GameplayServer';
import { ConfirmRequestType, toReadableText } from 'src/online/play/confirm_request';
import SpectatorClient from 'src/online/play/SpectatorClient';
import GameUser from '../../online/play/GameUser';
import Timer from './timer/Timer';
import CircleTimer from './timer/CircleTimer';
import GameAudio from './GameAudio';
import * as signals from './signals';

export default class Player extends GameplayClient {
  public gameRule = new GameRule();

  private userPlayInput: UserPlayInput;

  protected api: APIAccess = api;

  private gameplayClient = this;

  private gameplayServer = this as GameplayServer;

  private rulesetPlay: OnlineRulesetPlay;

  public spectatorClient = new SpectatorClient();

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
    super();
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
          this.gameplayServer.gameOver(winner.id as number);
        }, 0);
      };

      this.gameRule.activeChessHost.changed.add(
        (v: ChessHost) => this.onTurnActiveChessHost(v, false), this,
      );
    });

    this.rulesetPlay = new OnlineRulesetPlay();
    this.rulesetPlay.playfield = playfield;
    this.rulesetPlay.gameRule = this.gameRule;

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
      this.onExit();
    });

    signals.quit.add(this.exitScreen, this);
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

    this.spectatorClient.spectatorCount.value = this.room.spectatorCount;
  }

  private initTimers() {
    const playerView = this.context.$refs.playerView as Vue;
    const viewGameUserPanelRefs = (playerView.$refs.viewGameUserPanel as Vue).$refs;
    const otherGameUserPanelRefs = (playerView.$refs.otherGameUserPanel as Vue).$refs;
    this.localUser.gameTimer = viewGameUserPanelRefs.gameTimer as unknown as Timer;
    (this.localUser.gameTimer as unknown as Vue).$on('ended', () => {
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
      this.gameplayServer.gameOver(this.otherUser.id as number, true);
    });
    this.localUser.stepTimer.setSoundEnabled(true);

    this.otherUser.gameTimer = otherGameUserPanelRefs.gameTimer as unknown as Timer;
    (this.otherUser.gameTimer as unknown as Vue).$on('ended', () => {
      this.otherUser.stepTimer.setTotalSeconds(this.room.roomSettings.secondsCountdown);
    });
    this.otherUser.stepTimer = otherGameUserPanelRefs.stepTimer as unknown as Timer;
    this.otherUser.stepTimer.setSoundEnabled(this.isWatchingMode);

    (viewGameUserPanelRefs.circleStepTimer as unknown as CircleTimer)
      .setSyncTimer(this.localUser.stepTimer);
    (otherGameUserPanelRefs.circleStepTimer as unknown as CircleTimer)
      .setSyncTimer(this.otherUser.stepTimer);
  }

  private initListeners() {
    const { gameplayClient } = this;
    gameplayClient.connect();
    gameplayClient.userJoined = () => {
      GameAudio.play('room/user_join');
    };
    gameplayClient.userLeft = this.onUserLeft;

    gameplayClient.otherUserStatusChanged = (status: UserStatus, gameUser: GameUser) => {
      switch (status) {
        case UserStatus.OFFLINE:
          this.room.offlineAt = new Date().toString();
          this.showText(`对方已下线/掉线，你可以等待对方回来继续`);
          break;
        case UserStatus.ONLINE:
          this.context.$q.notify(`${gameUser.bindable.value?.nickname as string}已上线`);
          break;
        default:
          break;
      }
    };

    gameplayClient.isConnected.changed.add(() => {
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

  protected onExit() {
    this.exit();
    this.spectatorClient.exit();
    this.rulesetPlay.exit();
    this.channelManager.leaveChannel(this.room.channelId);
    signals.quit.removeAll();
    signals.exit.dispatch();
  }

  protected resultsReady(msg: GameplayMsgs.ResultsReadyMsg) {
    const gameUser = this.getGameUserByUserId(msg.uid) as GameUser;
    gameUser.readied.value = msg.readied;
    if (gameUser != this.localUser) {
      GameAudio.play(`room/${msg.readied ? 'readied' : 'unready'}`);
    }
  }

  protected gameStart(msg: GameplayMsgs.GameStartedMsg) {
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

  protected gamePause() {
    this.gameState.value = GameState.PAUSE;
    if (!this.isWatchingMode) {
      this.chessboard.hide();
    }
    this.showText('对局暂停');
  }

  protected gameResume() {
    this.gameState.value = GameState.PLAYING;
    if (!this.isWatchingMode) {
      this.chessboard.show();
    }
  }

  protected resultsGameOver(msg: GameplayMsgs.GameOverMsg) {
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
            this.gameplayServer.toggleReady(true);
          }
          this.gameState.value = GameState.READY;
        } else {
          this.partRoom();
        }
      },
    });
  }

  protected resultsWithdraw() {
    this.gameRule.withdraw();
  }

  protected resultsConfirmRequest(msg: GameplayMsgs.ConfirmRequestMsg) {
    if (this.isWatchingMode) {
      return;
    }
    // 对方发送的请求
    const onAction = (isOk: boolean) => {
      this.gameplayServer.confirmResponse(msg.reqType, isOk);
    };
    // 显示确认对话框
    this.exitActiveOverlays();
    this.context.$q.dialog({
      title: '确认',
      message: `对方想要${toReadableText(msg.reqType)}`,
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

  protected resultsConfirmResponse(msg: GameplayMsgs.ConfirmResponseMsg) {
    const title = this.isWatchingMode ? (ChessHost.BLACK ? '黑方' : '红方') : '对方';
    if (!msg.ok) {
      this.showText(`${title}不同意${toReadableText(msg.reqType)}`, 1000);
    }
  }

  protected resultsGameContinue() {
    this.localUser.online.value = true;
    this.gameplayServer.gameContinue(true);
  }

  protected resultsGameStates(msg: GameplayMsgs.GameStatesMsg) {
    this.room = msg.states.room as Room;
    this.loadState(msg.states, true);
    if (msg.states.room?.gameStatus == GameState.PLAYING) {
      this.gameState.value = GameState.PLAYING;
    }
  }

  protected gameContinueResponse(msg: GameplayMsgs.GameContinueResponseMsg) {
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

  protected onUserLeft(leftUser: GameUser) {
    if (this.gameState.value == GameState.PAUSE && !this.room.offlineAt) {
      this.chessboard.show();
      // eslint-disable-next-line
      this.textOverlay.hide();
    }
    this.gameState.value = GameState.READY;

    const { gameTimer, stepTimer } = leftUser;
    const { roomSettings: { gameDuration, stepDuration } } = this.room;

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
        this.gameplayServer.startGame();
      }
    } else {
      this.gameplayServer.toggleReady();
    }
  }

  public onWhiteFlagClick() {
    this.gameplayServer.confirmRequest(ConfirmRequestType.WHITE_FLAG);
    this.showText('已发送认输请求，等待对方回应', 1000);
  }

  public onChessDrawClick() {
    this.gameplayServer.confirmRequest(ConfirmRequestType.DRAW);
    this.showText('已发送和棋请求，等待对方回应', 1000);
  }

  public onWithdrawClick() {
    this.gameplayServer.confirmRequest(ConfirmRequestType.WITHDRAW);
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

      if (this.gameState.value == GameState.PLAYING) {
        this.gameplayServer.pauseGame();
      } else {
        this.gameplayServer.resumeGame();
      }
    } else {
      this.gameplayServer.confirmRequest(
        this.gameState.value == GameState.PLAYING
          ? ConfirmRequestType.PAUSE_GAME
          : ConfirmRequestType.RESUME_GAME,
      );
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
