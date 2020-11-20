import { APIRequest, HttpMethod } from "../api/api_request";
import Room from "./Room";

export default class JoinRoomRequest extends APIRequest {
    constructor(room: Room) {
        super();
        this.method = HttpMethod.PUT;
        this.path = `rooms/${room.id}/users/${this.user.id}`;

        this.addParam('password', room.password || '');
    }
}