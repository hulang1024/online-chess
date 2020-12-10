import User from "src/online/user/User";
import { UserStatus } from "./UserStatus";

export default interface SearchUserInfo extends User {
  isOnline: boolean;
  isFriend: boolean;
  isMutual: boolean;
  userStats: UserStats;
  status: UserStatus;
}

export interface UserStats {
  playCount: number;
  winCount: number;
  loseCount: number;
  drawCount: number;
}