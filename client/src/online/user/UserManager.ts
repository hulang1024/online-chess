import { socketService } from "src/boot/main";
import Signal from "src/utils/signals/Signal";
import { UserOfflineMsg, UserOnlineMsg, UserStatusChangedMsg } from "./user_server_messages";

export default class UserManager {
  public readonly userOnline = new Signal();

  public readonly userOffline = new Signal();

  public readonly userStatusChanged = new Signal();

  constructor() {
    socketService.on('user.offline', (msg: UserOfflineMsg) => {
      this.userOffline.dispatch(msg.uid, msg.nickname);
    }, this);

    socketService.on('user.online', (msg: UserOnlineMsg) => {
      this.userOnline.dispatch(msg.uid, msg.nickname);
    }, this);

    socketService.on('user.status_changed', (msg: UserStatusChangedMsg) => {
      this.userStatusChanged.dispatch(msg.user, msg.status);
    }, this);
  }
}
