import { socketService } from "src/boot/main";

export default class UserActivityClient {
  private socketService = socketService;

  public enter(activity: number) {
    this.socketService.queue((send) => {
      send('user_activity.enter', { code: activity });
    });
  }

  public exit(activity: number) {
    this.socketService.queue((send) => {
      send('user_activity.exit', { code: activity });
    });
  }
}
