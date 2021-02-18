import User from "src/user/User";
import ServerMsg from "../ws/ServerMsg";

export interface RoomUserJoinedMsg extends ServerMsg {
  user: User;
}

export interface RoomUserLeftMsg extends ServerMsg {
  uid: number;
}
