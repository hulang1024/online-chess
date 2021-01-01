import { APIRequest, HttpMethod } from "../api/api_request";
import Channel from "./Channel";
import Message from "./Message";

export default class GetMessagesRequest extends APIRequest<Message[]> {
  constructor(channel: Channel) {
    super();
    this.method = HttpMethod.GET;
    this.path = `chat/channels/${channel.id}/messages`;
    if (channel.lastMessageId) {
      this.addParam('startMessageId', channel.lastMessageId);
    }
  }
}
