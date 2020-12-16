import User from "src/online/user/User";
import UserStats from "./UserStats";
import UserStatus from "./UserStatus";

export default class SearchUserInfo extends User {
  isOnline: boolean;

  isFriend: boolean;

  isMutual: boolean;

  userStats: UserStats;

  status: UserStatus;
}
