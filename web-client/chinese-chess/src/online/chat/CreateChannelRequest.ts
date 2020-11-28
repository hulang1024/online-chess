import { APIRequest, HttpMethod } from "../api/api_request";
import Channel from "./Channel";
import ChannelType from "./ChannelType";

export default class CreateChannelRequest extends APIRequest {
    constructor(channel: Channel) {
        super();
        this.method = HttpMethod.POST;
        this.path = 'chat/channels';

        this.addParam('type', ChannelType.PM);
        this.addParam('targetId', channel.users[0].id);
    }
}