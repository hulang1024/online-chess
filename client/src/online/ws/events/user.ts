import UserStatus from "src/online/user/UserStatus";
import Signal from "../../../utils/signals/Signal";
import ServerMsg from "../ServerMsg";

export let loggedIn = new Signal();
export let online = new Signal();
export let offline = new Signal();
export let statusChanged = new Signal();

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
  status: UserStatus;
}