import { APIRequest, HttpMethod } from "../api/api_request";

export default class ListChannelsRequest extends APIRequest {
    constructor() {
        super();
        this.method = HttpMethod.GET;
        this.path = 'chat/channels';
    }
}