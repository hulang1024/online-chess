import { APIRequest, HttpMethod } from "../api/api_request";
import Room from "../room/Room";

export default class SpectateRequest extends APIRequest {
    private room: Room;

    constructor(room: Room) {
        super();
        this.room = room;
    }

    prepare() {
        this.method = HttpMethod.POST;
        this.path = `spectators/${this.user.id}`;

        this.addParam('roomId', this.room.id);
    }
}