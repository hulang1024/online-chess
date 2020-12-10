import User from "src/online/user/User";
import Signal from "src/utils/signals/Signal";
import ServerMsg from "../ServerMsg";

export let joined = new Signal();
export let left = new Signal();

export interface SpectatorJoinedMsg extends ServerMsg {
  user: User;
  spectatorCount: number;
}

export interface SpectatorLeftMsg extends ServerMsg {
  user: User;
  spectatorCount: number;
}