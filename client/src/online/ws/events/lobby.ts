import Room from "src/online/room/Room";
import Signal from "src/utils/signals/Signal";
import ServerMsg from "../ServerMsg";

export let roomCreated = new Signal();
export let roomUpdated = new Signal();
export let roomRemoved = new Signal();

export interface RoomCreatedMsg extends ServerMsg {
  room: Room
}

export interface RoomUpdatedMsg extends ServerMsg {
  room: Room
}

export interface RoomRemovedMsg extends ServerMsg {
  roomId: number
}