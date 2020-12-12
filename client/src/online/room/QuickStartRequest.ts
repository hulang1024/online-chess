import { APIRequest, HttpMethod } from "../api/api_request";
import Room from "./Room";

export default class QuickStartRequest extends APIRequest<Room> {
  constructor() {
    super();
    this.method = HttpMethod.POST;
    this.path = `rooms/quick_start`;
  }
}
