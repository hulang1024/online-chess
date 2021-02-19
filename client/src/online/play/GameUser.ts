import ChessHost from "src/rulesets/chess_host";
import User from "src/user/User";
import UserStatus from "src/user/UserStatus";
import Bindable from "src/utils/bindables/Bindable";
import BindableBool from "src/utils/bindables/BindableBool";
import Timer from "../../pages/play/timer/Timer";

export default class GameUser {
  public user = new Bindable<User | null>();

  public get id() {
    return this.user.value?.id;
  }

  public status = new Bindable<UserStatus>();

  public online = new BindableBool(true);

  public ready = new BindableBool();

  public chess = new Bindable<ChessHost>();

  public get chessHost() {
    return this.chess.value;
  }

  // todo: 从online包中移除
  public gameTimer: Timer;

  public stepTimer: Timer;

  public isRoomOwner = new BindableBool();
}
