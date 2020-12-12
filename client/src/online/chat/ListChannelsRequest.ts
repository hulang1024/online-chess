import { APIRequest, HttpMethod } from "../api/api_request";

export default class ListChannelsRequest extends APIRequest<unknown> {
  constructor() {
    super();
    this.method = HttpMethod.GET;
    this.path = 'chat/channels';
  }
}
