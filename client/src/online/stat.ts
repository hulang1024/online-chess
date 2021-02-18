import ServerMsg from "./ws/ServerMsg";

export interface StatOnlineCountMsg extends ServerMsg {
  online: number;
  guest: number;
}
