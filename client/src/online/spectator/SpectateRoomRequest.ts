import { APIRequest, HttpMethod } from "../api/api_request";
import Room from "../room/Room";
import SpectateResponse from "./APISpectateResponse";

export default class SpectateRoomRequest extends APIRequest<SpectateResponse> {
  private room: Room;

  constructor(room: Room) {
    super();
    this.room = room;
  }

  prepare() {
    this.method = HttpMethod.PUT;
    this.path = `rooms/${this.room.id}/spectators/${this.user.id}`;
  }
}
