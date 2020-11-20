import { APIRequest, HttpMethod } from "../api/api_request";
import Channel from "./Channel";

export default class GetMessagesRequest extends APIRequest {
    constructor(channel: Channel) {
        super();
        this.method = HttpMethod.GET;
        this.path = `chat/channels/${channel.id}/messages`;
    }
}