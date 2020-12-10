import { APIRequest, HttpMethod } from "../api/api_request";

export default class QuickStartRequest extends APIRequest {
    constructor() {
        super();
        this.method = HttpMethod.POST;
        this.path = `rooms/quick_start`;
    }
}