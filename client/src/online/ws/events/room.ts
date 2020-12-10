import User from "src/online/user/User";
import Signal from "src/utils/signals/Signal";
import ServerMsg from "../ServerMsg";

export let userJoined = new Signal();
export let userLeft = new Signal();

export interface RoomUserJoinedMsg extends ServerMsg {
  user: User;
}

export interface RoomUserLeftMsg extends ServerMsg {
  uid: number;
  nickname: string;
}