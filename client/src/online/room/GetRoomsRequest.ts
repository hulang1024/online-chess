import { APIRequest, HttpMethod } from "../api/api_request";
import SearchRoomParams from "./SearchRoomParams";

export default class GetRoomsRequest extends APIRequest<any> {
  constructor(searchParams?: SearchRoomParams) {
    super();
    this.method = HttpMethod.GET;
    this.path = 'rooms';

    this.addParam('gameType', searchParams?.gameType);
    this.addParam('status', searchParams?.status);
  }
}
