import { socketService, userManager } from 'src/boot/main';
import * as GameplayMsgs from 'src/online/play/gameplay_server_messages';
import BindableBool from 'src/utils/bindables/BindableBool';
import Bindable from 'src/utils/bindables/Bindable';
import UserStatus from 'src/user/UserStatus';
import GameUser from './GameUser';
import GameState from './GameState';
import { RoomUserJoinedMsg, RoomUserLeftMsg } from './room_server_messages';
import SearchUserInfo from '../user/SearchUserInfo';
import GameplayServer from './GameplayServer';

export default abstract class GameplayClient extends GameplayServer {
  public isConnected = new BindableBool();

  public gameState = new Bindable<GameState>(GameState.READY);

  public localUser = new GameUser();

  public otherUser = new GameUser();

  public otherUserStatusChanged: (status: UserStatus, gameUser: GameUser) => void;

  public userJoined: () => void;

  public userLeft: (leftUser: GameUser) => void;

  private disconnectHandler: () => void;

  private reconnectedHandler: () => void;

  public connect() {
    socketService.disconnect.add(this.disconnectHandler = () => {
      this.isConnected.value = false;
    });
    socketService.reconnected.add(this.reconnectedHandler = () => {
      this.isConnected.value = true;
    });

    socketService.on('room.user_join', this.handleUserJoined, this);
    socketService.on('room.user_left', this.handleUserLeft, this);

    userManager.userOffline.add(this.userOffline, this);
    userManager.userOnline.add(this.userOnline, this);
    userManager.userStatusChanged.add(this.onUserStatusChanged, this);

    socketService.on('play.ready', this.resultsReady, this);
    socketService.on('play.game_start', this.gameStart, this);
    socketService.on('play.game_pause', this.gamePause, this);
    socketService.on('play.game_resume', this.gameResume, this);
    socketService.on('play.game_over', this.resultsGameOver, this);
    socketService.on('play.game_continue', this.resultsGameContinue, this);
    socketService.on('play.game_continue_response', this.gameContinueResponse, this);
    socketService.on('play.game_states', this.resultsGameStates, this);
    socketService.on('play.chess_withdraw', this.resultsWithdraw, this);
    socketService.on('play.confirm_request', this.resultsConfirmRequest, this);
    socketService.on('play.confirm_response', this.resultsConfirmResponse, this);
  }

  public exit() {
    userManager.userOffline.remove(this.userOffline, this);
    userManager.userOnline.remove(this.userOnline, this);
    userManager.userStatusChanged.remove(this.onUserStatusChanged, this);

    [
      'room.user_join',
      'room.user_left',

      'play.ready',
      'play.game_start',
      'play.game_pause',
      'play.game_resume',
      'play.game_over',
      'play.game_continue',
      'play.game_continue_response',
      'play.game_states',
      'play.chess_withdraw',
      'play.confirm_request',
      'play.confirm_response',
    ].forEach((event) => {
      socketService.off(event);
    });

    socketService.disconnect.remove(this.disconnectHandler);
    socketService.reconnected.remove(this.reconnectedHandler);
    this.isConnected.changed.removeAll();
  }

  private handleUserJoined(msg: RoomUserJoinedMsg) {
    // 旁观模式时，localUser可能为空
    const gameUser = this.localUser.id
      ? msg.user.id == this.localUser.id
        ? this.localUser
        : this.otherUser
      : this.localUser;

    gameUser.user.value = msg.user;
    gameUser.online.value = true;
    gameUser.status.value = UserStatus.ONLINE;
    gameUser.ready.value = false;

    this.userJoined();
  }

  private handleUserLeft(msg: RoomUserLeftMsg) {
    const leftUser = msg.uid == this.localUser.id
      ? this.localUser
      : this.otherUser;

    leftUser.user.value = null;
    leftUser.ready.value = false;
    leftUser.online.value = false;

    this.userLeft(leftUser);
  }

  private userOffline(uid: number) {
    const gameUser = this.getGameUserByUserId(uid);
    if (!gameUser) {
      return;
    }
    gameUser.online.value = false;
    gameUser.status.value = UserStatus.OFFLINE;
    this.gameState.value = GameState.PAUSE;

    this.otherUserStatusChanged(gameUser.status.value, gameUser);
  }

  private userOnline(uid: number) {
    const gameUser = this.getGameUserByUserId(uid);
    if (!gameUser) {
      return;
    }
    gameUser.online.value = true;
    gameUser.status.value = UserStatus.ONLINE;
    this.otherUserStatusChanged(gameUser.status.value, gameUser);
  }

  private onUserStatusChanged(user: SearchUserInfo, status: UserStatus) {
    const gameUser = this.getGameUserByUserId(user.id);
    if (!gameUser) {
      return;
    }
    gameUser.status.value = status;
    this.otherUserStatusChanged(gameUser.status.value, gameUser);
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

  protected abstract resultsReady(msg: GameplayMsgs.ResultsReadyMsg): void;

  protected abstract gameStart(msg: GameplayMsgs.GameStartedMsg): void;

  protected abstract gamePause(): void;

  protected abstract gameResume(): void;

  protected abstract resultsGameOver(msg: GameplayMsgs.GameOverMsg): void;

  protected abstract resultsGameContinue(): void;

  protected abstract gameContinueResponse(msg: GameplayMsgs.GameContinueResponseMsg): void;

  protected abstract resultsGameStates(msg: GameplayMsgs.GameStatesMsg): void;

  protected abstract resultsWithdraw(): void;

  protected abstract resultsConfirmRequest(msg: GameplayMsgs.ConfirmRequestMsg): void;

  protected abstract resultsConfirmResponse(msg: GameplayMsgs.ConfirmResponseMsg): void;
}
