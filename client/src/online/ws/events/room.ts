import User from "src/user/User";
import Signal from "src/utils/signals/Signal";
import ServerMsg from "../ServerMsg";

export const userJoined = new Signal();
export const userLeft = new Signal();

export interface RoomUserJoinedMsg extends ServerMsg {
  user: User;
}

export interface RoomUserLeftMsg extends ServerMsg {
  uid: number;
  nickname: string;
}
