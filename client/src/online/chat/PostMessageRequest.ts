import { APIRequest, HttpMethod } from "../api/api_request";
import Message from "./Message";

export default class PostMessageRequest extends APIRequest<Message> {
  constructor(message: Message) {
    super();
    this.method = HttpMethod.POST;
    this.path = `chat/channels/${message.channelId}/messages`;

    this.addParam('content', message.content);
    this.addParam('isAction', message.isAction || undefined);
  }
}
