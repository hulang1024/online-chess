import { APIRequest, HttpMethod } from "../api/api_request";
import Room from "./Room";

export default class PartRoomRequest extends APIRequest {
    private room: Room;

    constructor(room: Room) {
        super();
        this.room = room;
    }

    prepare() {
        this.method = HttpMethod.DELETE;
        this.path = `rooms/${this.room.id}/users/${this.user.id}`;
    }
}