import { APIRequest, HttpMethod } from "../api/api_request";
import Room from "../room/Room";

export default class SpectateRequest extends APIRequest {
    constructor(room: Room) {
        super();
        this.method = HttpMethod.PUT;
        this.path = `spectators/${this.user.id}`;

        this.addParam('roomId', room.id);
    }
}