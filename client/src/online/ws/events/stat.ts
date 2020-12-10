import Signal from "src/utils/signals/Signal";
import ServerMsg from "../ServerMsg";

export let online = new Signal();

export interface StatOnlineCountMsg extends ServerMsg {
  online: number;
}