import SearchUserInfo from "src/online/user/SearchUserInfo";
import UserStatus from "src/user/UserStatus";
import ServerMsg from "../ws/ServerMsg";

export interface UserLoggedInMsg extends ServerMsg {
  uid: number;
  nickname: string;
}

export interface UserOnlineMsg extends ServerMsg {
  uid: number;
  nickname: string;
}

export interface UserOfflineMsg extends ServerMsg {
  uid: number;
  nickname: string;
}

export interface UserStatusChangedMsg extends ServerMsg {
  uid: number;
  user: SearchUserInfo;
  status: UserStatus;
}
