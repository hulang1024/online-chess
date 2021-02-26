import User from "src/user/User";
import UserStats from "../../user/UserStats";
import UserStatus from "../../user/UserStatus";

export default class UserDetails extends User {
  isOnline: boolean;

  isFriend: boolean;

  isMutual: boolean;

  scoreStats: UserStats[];

  status: UserStatus;

  loginDeviceOS: string;
}
