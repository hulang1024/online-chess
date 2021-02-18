import { socketService } from 'src/boot/main';
import User from 'src/user/User';
import Bindable from 'src/utils/bindables/Bindable';
import ServerMsg from '../ws/ServerMsg';

export default class SpectatorClient {
  private socketService = socketService;

  public spectatorCount = new Bindable<number>(0);

  constructor() {
    socketService.on('spectator.join', (msg: SpectatorJoinedMsg) => {
      this.spectatorCount.value = msg.spectatorCount;
    }, this);

    socketService.on('spectator.left', (msg: SpectatorLeftMsg) => {
      this.spectatorCount.value = msg.spectatorCount;
    }, this);
  }

  public exit() {
    [
      'spectator.join',
      'spectator.left',
    ].forEach((event) => {
      this.socketService.off(event);
    });
  }
}

interface SpectatorJoinedMsg extends ServerMsg {
  user: User;
  spectatorCount: number;
}

interface SpectatorLeftMsg extends ServerMsg {
  user: User;
  spectatorCount: number;
}
