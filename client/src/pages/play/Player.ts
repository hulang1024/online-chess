import APIAccess, { APIState } from 'src/online/api/APIAccess';
import Channel from 'src/online/chat/Channel';
import ChannelType from 'src/online/chat/ChannelType';
import ChannelManager from 'src/online/chat/ChannelManager';
import desktopNotify from 'src/components/notify';
import GameState from 'src/online/play/GameState';
import GameOverCause from 'src/online/play/GameOverCause';
import PartRoomRequest from 'src/online/room/PartRoomRequest';
import SpectateRoomRequest from 'src/online/spectator/SpectateRoomRequest';
import SpectateResponse from 'src/online/spectator/APISpectateResponse';
import Room from 'src/online/room/Room';
import * as GameplayMsgs from 'src/online/play/gameplay_server_messages';
import ResponseGameStates, { ResponseGameStateTimer } from 'src/rulesets/online/game_states_response';
import BindableBool from 'src/utils/bindables/BindableBool';
import { onBeforeUnmount, onMounted } from 'vue';
import { api, channelManager, userActivityClient } from 'src/boot/main';
import Message from 'src/online/chat/Message';
import InfoMessage from 'src/online/chat/InfoMessage';
import { existsEmoji } from 'src/assets/emoji';
import UserStatus from 'src/user/UserStatus';
import ChessHost from 'src/rulesets/chess_host';
import Playfield from 'src/pages/play/Playfield';
import GameRule from 'src/rulesets/GameRule';
import UserPlayInput from 'src/rulesets/UserPlayInput';
import RulesetClient from 'src/rulesets/online/RulesetClient';
import RulesetPlayer from 'src/rulesets/RulesetPlayer';
import RulesetFactory from 'src/rulesets/RulesetFactory';
import Ruleset from 'src/rulesets/Ruleset';
import GameplayClient from 'src/online/play/GameplayClient';
import GameplayServer from 'src/online/play/GameplayServer';
import { ConfirmRequestType, toReadableText } from 'src/online/play/confirm_request';
import SpectatorClient from 'src/online/play/SpectatorClient';
import APIGameUser from 'src/online/play/APIGameUser';
import { GameType } from 'src/rulesets/GameType';
import GameUser from '../../online/play/GameUser';
import Timer from '../../rulesets/ui/timer/Timer';
import CircleTimer from '../../rulesets/ui/timer/CircleTimer';
import GameAudio from '../../rulesets/GameAudio';
import * as playPageSignals from './signals';

export default class Player extends GameplayClient {
  public game: GameRule;

  private rulesetPlayer: RulesetPlayer;

  private userPlayInput: UserPlayInput;

  protected api: APIAccess = api;

  private gameplayClient = this;

  private gameplayServer = this as GameplayServer;

  private rulesetClient: RulesetClient;

  public spectatorClient = new SpectatorClient();

  private channelManager: ChannelManager = channelManager;

  protected playfield: Playfield;

  public room: Room;

  public isWatchingMode = false;

  public reverse = new BindableBool();

  public confirmRequestLoadings = {
    [ConfirmRequestType.DRAW]: new BindableBool(),
    [ConfirmRequestType.WITHDRAW]: new BindableBool(),
    [ConfirmRequestType.PAUSE_GAME]: new BindableBool(),
    [ConfirmRequestType.RESUME_GAME]: new BindableBool(),
  }

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

    this.localUser.user.value = api.localUser;
    this.room = room || initialGameStates?.room as Room;

    const { gameSettings } = this.room.roomSettings;
    const ruleset = RulesetFactory.create(gameSettings.gameType) as Ruleset;
    ruleset.gameSettings = gameSettings;

    this.rulesetPlayer = ruleset.createPlayer();
    this.rulesetPlayer.context = context;

    this.game = ruleset.createGameRule();
    this.rulesetPlayer.game = this.game;

    this.rulesetClient = ruleset.createRulesetClient(this.game);

    this.initListeners();

    const playfield = new Playfield(context, ruleset);
    this.playfield = playfield;

    this.rulesetClient.playfield = playfield;

    playfield.loaded.add(() => {
      this.game.setPlayfield(playfield);

      this.userPlayInput = ruleset.createUserPlayInput(
        this.game,
        this.gameState,
        this.localUser,
        this.isWatchingMode,
      );
      this.userPlayInput.player = this;
      this.rulesetPlayer.userPlayInput = this.userPlayInput;
      this.rulesetClient.userPlayInput = this.userPlayInput;
      this.userPlayInput.onReject = () => {
        if (this.isWatchingMode) {
          if (this.gameState.value == GameState.PLAYING) {
            this.showText('你正在观战中', 1000);
          } else {
            context.$q.notify({
              message: '你正在观战中',
              timeout: 1000,
            });
          }
        } else if (this.gameState.value == GameState.PLAYING) {
          this.showText('对方回合', 500);
          const playerView = this.context.$refs.playerView as Vue;
          // eslint-disable-next-line
          (playerView.$refs.otherGameUserPanel as any).blink();
        }
      };
      this.userPlayInput.inputDone.add(() => {
        this.localUser.stepTimer.pause();
        this.localUser.gameTimer.pause();
      });

      this.game.onGameOver = (winChessHost: ChessHost) => {
        if (this.isWatchingMode) {
          return;
        }
        if (winChessHost != this.localUser.chessHost) {
          return;
        }
        const winner = this.localUser.chessHost == winChessHost ? this.localUser : this.otherUser;
        setTimeout(() => {
          this.gameplayServer.gameOver(winner.chessHost, GameOverCause.NORMAL);
        }, 0);
      };

      this.game.activeChessHost.changed.add(
        (v: ChessHost) => this.onTurnActiveChessHost(v, false), this,
      );
    });

    onMounted(() => {
      const playerView = this.context.$refs.playerView as Vue;

      this.resultDialog = playerView.$refs.resultDialog;
      this.textOverlay = playerView.$refs.textOverlay;

      this.userPlayInput.setPlayerView(playerView);
      if (!this.isWatchingMode && playerView.$refs.gamepad) {
        this.userPlayInput.setGamepad(playerView.$refs.gamepad as Vue);
      }

      this.initTimers();
      this.loadState(initialGameStates);
      if (!this.isWatchingMode && this.localUser.status.value == UserStatus.IN_LOBBY) {
        userActivityClient.enter(3);
      }

      this.localUser.chess.addAndRunOnce((chessHost: ChessHost) => {
        this.otherUser.chess.value = ChessHost.reverse(chessHost);
      });

      let channel = new Channel();
      channel.name = '#当前房间';
      channel.id = this.room.channelId;
      channel.type = ChannelType.ROOM;
      channel = this.channelManager.joinChannel(channel);
      if (this.room.gameUsers.length == 1) {
        channel.messages.unshift(new InfoMessage('如无对手，可到QQ群:89536775寻找哦。'));
      }
      // eslint-disable-next-line
      (playerView.$refs.chatPanel as any)?.loadChannel(channel);
      channel.newMessagesArrived.add((messages: Message[]) => {
        const message = messages[messages.length - 1];
        if (!(message.content.length <= 4 && existsEmoji(message.content)
          && (new Date().getTime() - message.timestamp) < 4000)) {
          return;
        }
        const viewGameUserPanel = playerView.$refs.viewGameUserPanel as Vue;
        const otherGameUserPanel = playerView.$refs.otherGameUserPanel as Vue;
        // eslint-disable-next-line
        if ((viewGameUserPanel as any).user?.id == message.sender.id) {
          // eslint-disable-next-line
          (viewGameUserPanel as any).showEmoji(message.content);
        }
        // eslint-disable-next-line
        if ((otherGameUserPanel as any).user?.id == message.sender.id) {
          // eslint-disable-next-line
          (otherGameUserPanel as any).showEmoji(message.content);
        }
      });

      if (initialGameStates) {
        this.game.start(this.localUser.chessHost, initialGameStates);

        if (!this.isWatchingMode) {
          if (this.gameState.value == GameState.PAUSE) {
            this.showText('对局暂停中，等待对手回来继续');
          }

          if (this.gameState.value == GameState.END) {
            this.showText('对局已结束');
          }
        }
      }

      this.gameState.addAndRunOnce(this.onGameStateChanged, this);
    });

    onBeforeUnmount(() => {
      this.onExit();
    });

    playPageSignals.reload.add(() => {
      this.partRoom('/reload');
    }, this);
  }

  private loadState(states?: ResponseGameStates | undefined, isReload = false) {
    if (!isReload) {
      this.gameState.value = this.room.gameStatus || GameState.READY;
    }

    const setGameUser = (gameUser: GameUser, apiGameUser: APIGameUser) => {
      if (!apiGameUser) {
        return;
      }

      if (!isReload) {
        gameUser.user.value = apiGameUser.user;
      }
      gameUser.chess.value = apiGameUser.chess;
      gameUser.online.value = apiGameUser.online;
      gameUser.status.value = apiGameUser.status;
      gameUser.ready.value = apiGameUser.ready;
      gameUser.isRoomOwner.value = apiGameUser.roomOwner;

      if (!isReload) {
        const { gameSettings } = this.room.roomSettings;
        const { gameTimer, stepTimer } = gameUser;
        gameTimer.setTotalSeconds(gameSettings.timer.gameDuration);
        stepTimer.setTotalSeconds(gameSettings.timer.stepDuration);
        if (states) {
          gameTimer.ready(apiGameUser.timer.gameTime);
          stepTimer.ready(apiGameUser.timer.stepTime);
        } else {
          gameTimer.ready();
          stepTimer.ready();
        }
      }
    };

    this.room.gameUsers.forEach((gameUser) => {
      if (gameUser.user?.id == this.localUser.id) {
        setGameUser(this.localUser, gameUser);
      } else {
        setGameUser(this.otherUser, gameUser);
      }
    });

    this.spectatorClient.spectatorCount.value = this.room.spectatorCount;
  }

  private initTimers() {
    const { gameSettings } = this.room.roomSettings;
    const playerView = this.context.$refs.playerView as Vue;
    const viewGameUserPanelRefs = (playerView.$refs.viewGameUserPanel as Vue).$refs;
    const otherGameUserPanelRefs = (playerView.$refs.otherGameUserPanel as Vue).$refs;
    this.localUser.gameTimer = viewGameUserPanelRefs.gameTimer as unknown as Timer;
    (this.localUser.gameTimer as unknown as Vue).$on('ended', () => {
      // 如果局时用完，步时计时器用作读秒计数器
      this.localUser.stepTimer.setTotalSeconds(gameSettings.timer.secondsCountdown);
    });
    this.localUser.stepTimer = viewGameUserPanelRefs.stepTimer as unknown as Timer;
    (this.localUser.stepTimer as unknown as Vue).$on('ended', () => {
      if (this.isWatchingMode) {
        return;
      }
      this.userPlayInput.disable();
      // 如果步时/读秒时间用完
      this.gameplayServer.gameOver(this.otherUser.chessHost, GameOverCause.TIMEOUT);
    });
    this.localUser.stepTimer.setSoundEnabled(true);

    this.otherUser.gameTimer = otherGameUserPanelRefs.gameTimer as unknown as Timer;
    (this.otherUser.gameTimer as unknown as Vue).$on('ended', () => {
      this.otherUser.stepTimer.setTotalSeconds(gameSettings.timer.secondsCountdown);
    });
    this.otherUser.stepTimer = otherGameUserPanelRefs.stepTimer as unknown as Timer;
    this.otherUser.stepTimer.setSoundEnabled(this.isWatchingMode);

    let circleStepTimer;
    circleStepTimer = (viewGameUserPanelRefs.circleStepTimer as unknown as CircleTimer);
    if (circleStepTimer) {
      circleStepTimer.setSyncTimer(this.localUser.stepTimer);
    }

    circleStepTimer = (otherGameUserPanelRefs.circleStepTimer as unknown as CircleTimer);
    if (circleStepTimer) {
      circleStepTimer.setSyncTimer(this.otherUser.stepTimer);
    }
  }

  private initListeners() {
    const { gameplayClient } = this;
    gameplayClient.connect();
    gameplayClient.userJoined = (joinUser: GameUser) => {
      const { gameTimer, stepTimer } = joinUser;
      const { gameSettings } = this.room.roomSettings;
      gameTimer.setTotalSeconds(gameSettings.timer.gameDuration);
      stepTimer.setTotalSeconds(gameSettings.timer.stepDuration);
      stepTimer.ready();
      gameTimer.ready();

      GameAudio.play('room/user_join');
      if (!this.isWatchingMode) {
        // eslint-disable-next-line
        desktopNotify('有玩家加入房间');
      }
    };
    gameplayClient.userLeft = this.onUserLeft;

    gameplayClient.otherUserStatusChanged = (status: UserStatus) => {
      const name = this.isWatchingMode ? '玩家' : '对方';
      switch (status) {
        case UserStatus.OFFLINE:
          this.room.offlineAt = new Date().toString();
          this.showText(`${name}已断线，你可以等待${name}回来继续`);
          break;
        case UserStatus.ONLINE:
          break;
        default:
          break;
      }
    };

    gameplayClient.isConnected.changed.add((isConnected: boolean) => {
      if (isConnected) {
        return;
      }

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
    this.rulesetClient.exit();
    this.game.destory();
    this.channelManager.leaveChannel(this.room.channelId);
    playPageSignals.reload.removeAll();
    playPageSignals.exited.dispatch();
  }

  protected resultsReady(msg: GameplayMsgs.ResultsReadyMsg) {
    const gameUser = this.getGameUserByUserId(msg.uid) as GameUser;
    gameUser.ready.value = msg.ready;
    if (gameUser != this.localUser) {
      GameAudio.play(`room/${msg.ready ? 'ready' : 'unready'}`);
    }
  }

  // eslint-disable-next-line
  protected gameStartBefore() { }

  protected gameStart(msg: GameplayMsgs.GameStartedMsg) {
    this.game.activeChessHost.value = null;
    msg.userHosts.forEach(({ uid, chess }) => {
      const gameUser = this.getGameUserByUserId(uid) as GameUser;
      gameUser.chess.value = chess;

      const { gameTimer, stepTimer } = gameUser;
      const { gameSettings } = this.room.roomSettings;
      gameTimer.setTotalSeconds(gameSettings.timer.gameDuration);
      stepTimer.setTotalSeconds(gameSettings.timer.stepDuration);
      gameTimer.ready();
      stepTimer.ready();
    });

    this.gameState.value = GameState.PLAYING;

    GameAudio.play('gameplay/started');
    this.showText(`开始对局`, 1000);
    // eslint-disable-next-line
    desktopNotify('对局开始了');

    this.gameStartBefore();

    this.game.start(
      this.isWatchingMode ? this.game.viewChessHost : this.localUser.chessHost,
      msg.initialStates,
    );
    // 因为activeChessHost一般一直是先手，值相同将不能触发，这里手动触发一次
    this.onTurnActiveChessHost(ChessHost.FIRST);
  }

  protected gamePause() {
    this.gameState.value = GameState.PAUSE;
    this.confirmRequestLoadings[ConfirmRequestType.PAUSE_GAME].value = false;
    if (!this.isWatchingMode) {
      this.playfield.hideContent();
    }
  }

  protected gameResume() {
    this.gameState.value = GameState.PLAYING;
    this.confirmRequestLoadings[ConfirmRequestType.RESUME_GAME].value = false;
    if (!this.isWatchingMode) {
      this.playfield.showContent();
    }
  }

  protected resultsGameOver(gameOverMsg: GameplayMsgs.GameOverMsg) {
    this.gameState.value = GameState.END;

    if (this.localUser.isRoomOwner.value) {
      this.otherUser.ready.value = false;
    }

    this.game.activeChessHost.value = null;

    if (gameOverMsg.cause == GameOverCause.TIMEOUT) {
      [this.otherUser, this.localUser]
        .filter((user) => user.chessHost !== gameOverMsg.winHost)
        .forEach((loser) => {
          loser.stepTimer.setCurrent(0);
        });
    }

    if (this.isWatchingMode) {
      return;
    }

    api.localUser.playGameType = this.room.roomSettings.gameSettings.gameType;

    const result = gameOverMsg.winHost
      ? (this.localUser.chessHost == gameOverMsg.winHost ? 1 : 2)
      : 0;

    const onGameEnd = () => {
      this.exitActiveOverlays();
      // eslint-disable-next-line
      this.resultDialog.open({
        result,
        cause: gameOverMsg.cause,
        action: (option: string) => {
          switch (option) {
            case 'again':
            case 'ok':
              if (!this.localUser.isRoomOwner.value) {
                if (option == 'again') {
                  this.gameplayServer.toggleReady(true);
                } else {
                  this.localUser.ready.value = false;
                }
              }
              this.gameState.value = GameState.READY;
              break;
            default:
              break;
          }
        },
      });
    };
    if (this.game.ended || gameOverMsg.cause != GameOverCause.NORMAL) {
      onGameEnd();
      this.game.ended = true;
    } else {
      this.game.onGameEnd = onGameEnd;
    }
  }

  protected resultsWithdraw() {
    this.game.withdraw();
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
    const title = this.isWatchingMode
      ? this.getChessHostName(this.getGameUserByUserId(msg.uid)?.chessHost as ChessHost)
      : '对方';
    if (!msg.ok) {
      this.showText(`${title}不同意${toReadableText(msg.reqType)}`, 1000);
    }
    this.confirmRequestLoadings[msg.reqType as ConfirmRequestType].value = false;
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
      this.playfield.showContent();
      this.showText('对手已回来，对局继续', 3000);
    } else {
      this.gameState.value = GameState.READY;
      this.otherUser.user.value = null;
      this.showText('对手已选择不继续对局', 2000);
    }
  }

  protected onUserLeft(leftUser: GameUser) {
    if (this.gameState.value == GameState.PAUSE && !this.room.offlineAt) {
      this.playfield.showContent();
      // eslint-disable-next-line
      this.textOverlay.hide();
    }
    this.gameState.value = GameState.READY;

    const { gameTimer, stepTimer } = leftUser;
    gameTimer.stop();
    stepTimer.stop();

    this.game.activeChessHost.value = null;

    GameAudio.play('room/user_left');

    if (!this.localUser.isRoomOwner.value) {
      this.localUser.isRoomOwner.value = true;
      this.otherUser.isRoomOwner.value = false;
      if (!this.isWatchingMode) {
        this.context.$q.notify('你成为了房主');
      }
    }

    if (this.isWatchingMode && (this.localUser.id == null && this.otherUser.id == null)) {
      this.context.$q.notify({ message: '你观战的房间已经解散' });
      this.exitScreen();
    }
  }

  private onGameStateChanged(gameState: GameState, prevGameState: GameState) {
    const doAllTimer = (method: string) => {
      [
        this.localUser.gameTimer, this.localUser.stepTimer,
        this.otherUser.gameTimer, this.otherUser.stepTimer,
      ].filter(Boolean).forEach((timer) => {
        if (method == 'pause') {
          timer.pause();
        } else if (method == 'stop') {
          timer.stop();
        }
      });
    };

    switch (gameState) {
      case GameState.PLAYING: {
        if (prevGameState == GameState.PAUSE) {
          // 之前离线暂停，现在恢复
          let activeGameUser: GameUser;
          if (this.game.activeChessHost.value == this.localUser.chessHost) {
            activeGameUser = this.localUser;
            if (!this.isWatchingMode) {
              // 禁用过，现在应启用输入
              this.userPlayInput.enable();
            }
          } else {
            activeGameUser = this.otherUser;
          }
          activeGameUser.gameTimer.resume();
          activeGameUser.stepTimer.resume();
          this.playfield.showContent();
          this.showText('对局继续', 1000);
        }
        break;
      }
      case GameState.PAUSE:
        doAllTimer('pause');
        break;
      case GameState.READY:
      case GameState.END:
        doAllTimer('stop');
        break;
      default:
        break;
    }
    Object.keys(this.confirmRequestLoadings).forEach((key) => {
      this.confirmRequestLoadings[key as unknown as ConfirmRequestType].value = false;
    });
  }

  protected getChessHostName(chess: ChessHost) {
    return ({
      [GameType.chinesechess]: {
        [ChessHost.FIRST]: '红方',
        [ChessHost.SECOND]: '黑方',
      },
      [GameType.chinesechessDark]: {
        [ChessHost.FIRST]: '红方',
        [ChessHost.SECOND]: '黑方',
      },
      [GameType.gobang]: {
        [ChessHost.FIRST]: '黑方',
        [ChessHost.SECOND]: '白方',
      },
      [GameType.reversi]: {
        [ChessHost.FIRST]: '黑方',
        [ChessHost.SECOND]: '白方',
      },
    })[this.room.roomSettings.gameSettings.gameType][chess];
  }

  private onTurnActiveChessHost(activeChessHost: ChessHost, isGameResume = false) {
    this.game.activeChessHost.value = activeChessHost;

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

    if (!this.isWatchingMode) {
      if (activeChessHost == this.localUser.chessHost) {
        this.userPlayInput.enable();
      } else {
        this.userPlayInput.disable();
      }
    }
  }

  public onReadyStartClick() {
    if (this.localUser.isRoomOwner.value) {
      if (this.otherUser.id && this.otherUser.ready.value) {
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
    this.context.$q.dialog({
      title: '确认',
      message: '你真的要认输吗',
      persistent: true,
      ok: {
        label: '确定',
        color: 'negative',
      },
      cancel: {
        label: '取消',
        color: 'white',
        textColor: 'black',
      },
    }).onOk(() => {
      this.gameplayServer.whiteFlag();
    });
  }

  public onChessDrawClick() {
    this.confirmRequestLoadings[ConfirmRequestType.DRAW].value = true;
    this.gameplayServer.confirmRequest(ConfirmRequestType.DRAW);
    this.showText('已发送和棋请求，等待对方回应', 1000);
  }

  public onWithdrawClick() {
    this.confirmRequestLoadings[ConfirmRequestType.WITHDRAW].value = true;
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
        && this.otherUser.status.value == UserStatus.AFK
        && this.game.activeChessHost.value == this.otherUser.chessHost) {
        this.context.$q.notify('对方现在是离开状态，请等待对方回来');
        return;
      }

      if (this.gameState.value == GameState.PLAYING) {
        this.gameplayServer.pauseGame();
      } else {
        this.gameplayServer.resumeGame();
      }
    } else {
      const reqType = this.gameState.value == GameState.PLAYING
        ? ConfirmRequestType.PAUSE_GAME
        : ConfirmRequestType.RESUME_GAME;
      this.gameplayServer.confirmRequest(reqType);
      this.showText('已发送请求，等待对方回应', 1000);
      this.confirmRequestLoadings[reqType].value = true;
    }
  }

  public onToggleViewClick() {
    this.reverse.toggle();
    this.game.reverseChessLayoutView();
  }

  public onQuitClick() {
    if ([GameState.READY, GameState.END].includes(this.gameState.value)) {
      this.partRoom();
    } else {
      let label = '退出房间';
      let text = '是否真的退出房间？';
      if (this.gameState.value == GameState.PLAYING) {
        text = '对局进行中，是否真的退出房间？';
      }
      if (this.gameState.value == GameState.PAUSE) {
        if (this.room.offlineAt) {
          text = '对局暂停中，是否解散棋局？<br>(你也可以退出登录，棋局将保留3小时)';
          label = '解散棋局';
        } else {
          text = '对局暂停中，是否真的退出房间？';
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

  public onToSpectateClick() {
    const canToSpectate = (
      (this.localUser.user.value && this.otherUser.user.value)
      && (this.localUser.isRoomOwner.value
        || (!this.localUser.isRoomOwner.value && !this.localUser.ready.value))
      && this.gameState.value == GameState.READY
    );
    if (!canToSpectate) {
      return;
    }

    playPageSignals.reload.dispatch();
    playPageSignals.exited.addOnce(() => {
      const { $q } = this.context;
      $q.loading.show();
      const req = new SpectateRoomRequest(this.room);
      req.success = async (result: SpectateResponse) => {
        await this.context.$router.push({
          name: 'spectate',
          replace: true,
          query: { room_id: result.room.id as unknown as string },
          params: { spectateResponse: result as unknown as string },
        });
        $q.loading.hide();
      };
      req.failure = () => {
        $q.notify({ type: 'error', message: '观战失败' });
        $q.loading.hide();
        this.exitScreen();
      };
      api.perform(req);
    });
  }

  public onSettingsClick() {
    this.rulesetPlayer.openSettings();
  }

  public onHelpClick() {
    this.rulesetPlayer.openHelp();
  }

  public showText(text: string, duration?: number) {
    // eslint-disable-next-line
    this.textOverlay.show(text, duration);
  }

  protected partRoom(toScreen = '/') {
    if (!this.room) {
      this.exitScreen(toScreen);
      return;
    }
    const req = new PartRoomRequest(this.room);
    req.success = () => {
      this.exitScreen(toScreen);
    };
    req.failure = () => {
      this.exitScreen(toScreen);
    };
    this.api.queue(req);
  }

  protected exitScreen(name = '/') {
    // eslint-disable-next-line
    this.context.$router.replace(name);
  }

  protected exitActiveOverlays() {
    // eslint-disable-next-line
    (this.context.$vnode.context?.$refs.toolbar as any).exitActive();
  }
}
