import User from "../../user/User";
import { APIRequest, HttpMethod } from "../api/api_request";
import Message from "./Message";
import APICreatedNewPM from "./APICreatedNewPM";

export default class CreateNewPrivateMessageRequest extends APIRequest<APICreatedNewPM> {
  constructor(user: User, message: Message) {
    super();
    this.method = HttpMethod.POST;
    this.path = 'chat/new';

    this.addParam('targetId', user.id);
    this.addParam('content', message.content);
    this.addParam('isAction', message.isAction);
  }
}
