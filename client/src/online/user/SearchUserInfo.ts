import User from "src/user/User";
import UserStats from "../../user/UserStats";
import UserStatus from "../../user/UserStatus";
import UserDeviceInfo from "./UserDeviceInfo";

export default class SearchUserInfo extends User {
  isOnline: boolean;

  isFriend: boolean;

  isMutual: boolean;

  userStats: UserStats;

  status: UserStatus;

  deviceInfo: UserDeviceInfo;
}
