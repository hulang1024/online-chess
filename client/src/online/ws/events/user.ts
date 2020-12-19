import SearchUserInfo from "src/online/user/SearchUserInfo";
import UserStatus from "src/user/UserStatus";
import Signal from "../../../utils/signals/Signal";
import ServerMsg from "../ServerMsg";

export const loggedIn = new Signal();
export const online = new Signal();
export const offline = new Signal();
export const statusChanged = new Signal();

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
