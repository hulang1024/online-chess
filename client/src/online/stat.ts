import ServerMsg from "./ws/ServerMsg";

export interface StatOnlineCountMsg extends ServerMsg {
  online: number;
  pc: number;
  mobile: number;
  guest: number;
}
