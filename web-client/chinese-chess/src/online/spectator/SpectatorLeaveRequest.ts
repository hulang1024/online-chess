import { APIRequest, HttpMethod } from "../api/api_request";
import Room from "../room/Room";

export default class SpectatorLeaveRequest extends APIRequest {
    private room: Room;

    constructor(room: Room) {
        super();
        this.room = room;
    }

    prepare() {
        this.method = HttpMethod.DELET;
        this.path = `spectators/${this.user.id}`;
        this.addParam('roomId', this.room.id);
    }
}