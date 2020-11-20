import { APIRequest, HttpMethod } from "../api/api_request";
import Room from "./Room";

export default class PartRoomRequest extends APIRequest {
    constructor(room: Room) {
        super();
        this.method = HttpMethod.DELET;
        this.path = `rooms/${room.id}/users/${this.user.id}`;
    }
}