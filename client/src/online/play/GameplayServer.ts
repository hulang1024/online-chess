import { socketService } from 'src/boot/main';
import { ConfirmRequestType } from 'src/online/play/confirm_request';

export default class GameplayServer {
  private socketService = socketService;

  public toggleReady(isReady?: boolean) {
    this.socketService.send('play.ready', { ready: isReady });
  }

  public startGame() {
    this.socketService.send('play.start_game');
  }

  public pauseGame() {
    this.socketService.send('play.pause_game');
  }

  public resumeGame() {
    this.socketService.send('play.resume_game');
  }

  public gameOver(winHost: number, cause: number) {
    this.socketService.send('play.game_over', { winHost, cause });
  }

  public gameContinue(isOk: boolean) {
    this.socketService.send('play.game_continue', { ok: isOk });
  }

  public whiteFlag() {
    this.socketService.send('play.white_flag');
  }

  public confirmResponse(reqType: ConfirmRequestType, isOk: boolean) {
    this.socketService.send('play.confirm_response', { reqType, ok: isOk });
  }

  public confirmRequest(reqType: ConfirmRequestType) {
    this.socketService.send('play.confirm_request', { reqType });
  }
}
