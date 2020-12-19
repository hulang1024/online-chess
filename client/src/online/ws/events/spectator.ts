import User from "src/user/User";
import Signal from "src/utils/signals/Signal";
import ServerMsg from "../ServerMsg";

export const joined = new Signal();
export const left = new Signal();

export interface SpectatorJoinedMsg extends ServerMsg {
  user: User;
  spectatorCount: number;
}

export interface SpectatorLeftMsg extends ServerMsg {
  user: User;
  spectatorCount: number;
}
