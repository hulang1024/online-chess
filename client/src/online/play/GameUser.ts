import ChessHost from "src/rulesets/chinesechess/chess_host";
import User from "src/user/User";
import UserStatus from "src/user/UserStatus";
import Bindable from "src/utils/bindables/Bindable";
import BindableBool from "src/utils/bindables/BindableBool";
import Timer from "../../pages/play/timer/Timer";

export default class GameUser {
  public bindable = new Bindable<User | null>();

  public get id() {
    return this.bindable.value?.id;
  }

  public status = new Bindable<UserStatus>();

  public online = new BindableBool(true);

  public readied = new BindableBool();

  public chessHostBindable = new Bindable<ChessHost>();

  public get chessHost() {
    return this.chessHostBindable.value;
  }

  // todo: 从online包中移除
  public gameTimer: Timer;

  public stepTimer: Timer;

  public isRoomOwner = new BindableBool();
}
