import { APIRequest, HttpMethod } from "../api/api_request";
import Channel from "./Channel";

export default class ListChannelsRequest extends APIRequest<Channel[]> {
  constructor() {
    super();
    this.method = HttpMethod.GET;
    this.path = 'chat/channels';
  }
}
