import Room from "src/online/room/Room";
import Signal from "src/utils/signals/Signal";
import ServerMsg from "../ws/ServerMsg";

export const roomCreated = new Signal();
export const roomUpdated = new Signal();
export const roomRemoved = new Signal();

export interface RoomCreatedMsg extends ServerMsg {
  room: Room
}

export interface RoomUpdatedMsg extends ServerMsg {
  room: Room
}

export interface RoomRemovedMsg extends ServerMsg {
  roomId: number
}
