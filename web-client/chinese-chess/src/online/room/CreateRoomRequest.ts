import { APIRequest, HttpMethod } from "../api/api_request";
import Room from "./Room";

export default class CreateRoomRequest extends APIRequest {
    constructor(room: Room) {
        super();
        this.method = HttpMethod.POST;
        this.path = 'rooms';

        this.addParam('name', room.name);
        if (room.password) {
            this.addParam('password', room.password);
        }
    }
}