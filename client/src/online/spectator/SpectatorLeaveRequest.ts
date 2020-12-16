import APIResult from "../api/APIResult";
import { APIRequest, HttpMethod } from "../api/api_request";
import Room from "../room/Room";

export default class SpectatorLeaveRequest extends APIRequest<APIResult> {
  private room: Room;

  constructor(room: Room) {
    super();
    this.room = room;
  }

  prepare() {
    this.method = HttpMethod.DELETE;
    this.path = `rooms/${this.room.id}/spectators/${this.user.id}`;
  }
}
