import { APIRequest, HttpMethod } from "../api/api_request";
import Room from "./Room";

export default class GetRoomsRequest extends APIRequest {
    constructor() {
        super();
        this.method = HttpMethod.GET;
        this.path = 'rooms';
    }
}