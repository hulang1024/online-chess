import User from "src/user/User";
import UserStats from "../../user/UserStats";
import UserStatus from "../../user/UserStatus";

export default class SearchUserInfo extends User {
  isOnline: boolean;

  isFriend: boolean;

  isMutual: boolean;

  userStats: UserStats;

  status: UserStatus;

  loginDeviceOS: string;
}
